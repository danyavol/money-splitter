import { HttpEvent, HttpResponse, HttpHandler, HttpRequest, HttpEventType } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { LocalStorageService } from "src/app/database/local-storage.service";
import { CACHE_VERSION } from "../caching-rules";

// Don't change it. Change CACHE_VERSION if you want to clear old cache
// It must be persistent to be able to find old cache versions
export const CACHE_PREFIX = 'ms-cache';

export type CachedHttpResponse<T> = {
    response: HttpResponse<T>;
    timeCached: string; // Date string
}

export abstract class BaseCacheStrategy<T> {
    constructor(private storage: LocalStorageService, private rulePrefix: string) {}

    abstract getData(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>>;

    protected getCache(request: HttpRequest<T>): Observable<CachedHttpResponse<T> | undefined> {
        const cacheKey = this.getCacheKey(request);
        return this.storage.get<CachedHttpResponse<T>>(cacheKey);
    }

    protected saveCache(request: HttpRequest<T>, response: HttpEvent<T>): Observable<void> {
        // Ignore saving if response is not full
        if (response.type !== HttpEventType.Response) return of(undefined);

        const cacheKey = this.getCacheKey(request);
        const cache: CachedHttpResponse<T> = {
            response,
            timeCached: new Date().toISOString()
        };
        return this.storage.set(cacheKey, cache);
    }

    protected sendRequest(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        return next.handle(req);
    }

    protected getCacheKey(req: HttpRequest<T>): string {
        return `${this.getFullCachePrefix()}${req.method}${req.urlWithParams}`;
    }

    // It can be used if you want to find and invalidate cache for the whole rule
    getFullCachePrefix() {
        return `${CACHE_PREFIX}${CACHE_VERSION}${this.rulePrefix}`;
    }
}
