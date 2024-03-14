import { Injectable, Provider } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS
} from '@angular/common/http';

import { Observable } from 'rxjs';



/** Pass untouched request through to the next request handler. */
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    return next.handle(req);
  }
}

export const noopInterceptorProvider: Provider =
  { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true };
