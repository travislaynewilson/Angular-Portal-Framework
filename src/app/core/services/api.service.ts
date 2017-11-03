import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

import {LoaderService} from '../loader';

@Injectable()
export class ApiService {

  apiUrl = 'https://jsonplaceholder.typicode.com/';

  constructor(private http: HttpClient, private loaderService: LoaderService) {

  }

  getUsers() : Observable<any> {
    return this.http.get(this.apiUrl + 'users');
  }

}
