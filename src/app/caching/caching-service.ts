import { Injectable, inject } from "@angular/core";
import { LocalStorageService } from "../database/local-storage.service";
import { CACHE_VERSION, rules } from "./caching-rules";
import { Observable, first, forkJoin, map, switchMap } from "rxjs";
import { CACHE_PREFIX } from "./strategies/base-strategy";
import { HttpEvent, HttpHandler, HttpRequest } from "@angular/common/http";

@Injectable({
    providedIn: "root"
})
export class CacheService {
    private storage = inject(LocalStorageService);

    rules = rules(this.storage);

    constructor() {
        this.clearOldCache();

        this.rules
    }

    matchRule<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        const rule = this.rules.find(r => r.path.test(req.urlWithParams));

        console.log(rule);
        if (rule) {
            return rule.strategy.getData(req, next);
        } else {
            // Ignore if rule not found
            return next.handle(req);
        }
    }

    clearRuleCache(rulePrefix: string) {
        // TODO
    }

    private clearOldCache() {
        // Clear all cache which has different CACHE_VERSION
        this.storage.getKeys().pipe(
            map(keys =>
                keys.filter(key => key.startsWith(CACHE_PREFIX) && !key.startsWith(CACHE_PREFIX + CACHE_VERSION))
            ),
            switchMap(keysToRemove => {
                const observables: Observable<any>[] = [];

                keysToRemove.forEach(key => {
                    observables.push(this.storage.remove(key))
                });

                return forkJoin(observables);
            }),
            first()
        ).subscribe();
    }
}
