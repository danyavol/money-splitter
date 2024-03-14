import { HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable, map, of, switchMap } from "rxjs";
import { BaseCacheStrategy, CachedHttpResponse } from "./base-strategy";
import { LocalStorageService } from "src/app/database/local-storage.service";

export class StaleWhileRevalidate<T = any> extends BaseCacheStrategy<T> {

    constructor(private props: {
        storage: LocalStorageService,
        rulePrefix: string,
        maxAge?: number, // seconds
    }) {
        super(props.storage, props.rulePrefix);
    }

    override getData(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        // Try to get cached data first
        return this.getCache(req).pipe(
            switchMap((cache) => {
                if (!cache) {
                    // If there are no cache - send the request
                    return this.fetchAndSave(req, next);
                } else {
                    // If cache exists - check if it expired

                    if (this.isCacheFresh(cache)) {
                        // Fetch fresh data in background
                        this.fetchAndSave(req, next).subscribe();
                    }

                    return of(cache.response);
                }
            })
        );
    }

    // Shows whether cache is "fresh" and can be reused,
    // or it is already "stale" and needs to be resfreshed(refetched)
    private isCacheFresh<T>(cache: CachedHttpResponse<T>): boolean {
        // Always refetch if maxAge not specified
        if (!this.props.maxAge) return false;

        const maxDate = new Date(cache.timeCached);
        maxDate.setTime(maxDate.getTime() + this.props.maxAge * 1000);

        return maxDate > new Date();
    }

    private fetchAndSave(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        return this.sendRequest(req, next).pipe(
            // After that save response into cache
            switchMap(res => this.saveCache(req, res).pipe(map(() => res)))
        );
    }
}
