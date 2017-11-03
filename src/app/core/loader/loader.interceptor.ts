import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';

import {LoaderService} from './loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

    constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    var _this = this;

    if(req instanceof HttpRequest) {        
        this.loaderService.show();
    }
    
    return next.handle(req)
        .do(event => {
            if (event instanceof HttpResponse) {
                _this.loaderService.hide();
            }
        });            
  }
}