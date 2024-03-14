import { Injectable, Provider, inject } from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CacheService } from './caching-service';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
    cacheService = inject(CacheService);

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        // TODO: Interceptor not called for non HttpClient requests
        return this.cacheService.matchRule(req, next);
    }
}

export const cacheInterceptorProvider: Provider = {
    provide: HTTP_INTERCEPTORS,
    useClass: CacheInterceptor,
    multi: true,
};
