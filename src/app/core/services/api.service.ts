import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

import {LoaderService} from '../loader';

@Injectable()
export class ApiService {

  apiUrl = 'https://jsonplaceholder.typicode.com/';

  constructor(private http: HttpClient, private loaderService: LoaderService) {

  }

  private get(url: string, options?: any) {
    return this.http.get(this.apiUrl + url, options);
  }


  getUsers() : Observable<any> {
    return this.get('users');
  }
}
