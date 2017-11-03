import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { environment } from '../../../environments/environment';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if(environment.production) return next.handle(req);

    var _this = this;

    const started = Date.now();
    
    return next.handle(req)
        .do(event => {
            if (event instanceof HttpResponse) {
                const elapsed = Date.now() - started;
                console.log(`Request for ${req.urlWithParams} took ${elapsed} ms.`);
            }
        });            
  }
}