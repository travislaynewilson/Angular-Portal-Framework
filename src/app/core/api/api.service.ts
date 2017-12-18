import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of'
import { Subject } from 'rxjs/Subject';
import {
	catchError,
	debounceTime,
	distinctUntilChanged,
	tap
} from 'rxjs/operators';
import { LoaderService } from '../loader';



@Injectable()
export class ApiService {

	apiUrl = 'https://jsonplaceholder.typicode.com/';


	constructor (private http: HttpClient, private loaderService: LoaderService) {
	}

	private get(url: string, options?: any) {
		return this.http.get(this.apiUrl + url, options)
			.pipe(
			catchError(this.handleError(url, []))
			);
	}

	getUsers(): Observable<any> {
		return this.get('users');
	}


	/**
	 * Handle Http operation that failed.
	 * @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {

			console.error(`${operation} failed: ${error.message}`, error);

			// Let the app keep running by returning an empty result.
			return of(result as T);
		};
	}
}
