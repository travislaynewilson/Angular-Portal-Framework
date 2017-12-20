import { Injectable, Inject } from '@angular/core';
import { WebStorageService } from '@app/core/storage';
import { AUTH_WEB_STORAGE_SERVICE } from './auth-web-storage-service.token';



@Injectable()
export class AuthService {

	constructor(
		@Inject(AUTH_WEB_STORAGE_SERVICE) private store: WebStorageService
	) {
		store.set('hello', 'world');
		console.log(store, store.get('hello'));
	}

	login(username: string, password: string): boolean {
		if (username === 'admin' && password === 'password') {
			localStorage.setItem('username', username);
			return true;
		}

		return false;
	}

	logout(): any {
		localStorage.removeItem('username');
	}

	getUser(): any {
		return localStorage.getItem('username');
	}

	isAuthenticated(): boolean {
		return this.getUser() !== null;
	}
}



export const AUTH_SERVICE_PROVIDERS: Array<any> = [
	{ provide: AuthService, useClass: AuthService }
];
