import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { WebStorageService } from '@app/core/storage';
import { AUTH_WEB_STORAGE_SERVICE } from './auth-web-storage-service.token';
import { User } from './user';



/** Describes an event emitted when a user is signed in or out */
export class AuthenticatedEvent {
	constructor (
		public authenticated: boolean,
		public user?: User | null) { }
};



@Injectable()
export class AuthService {

	private readonly USER_STORE_KEY: string = 'user';

	/** Emits whenever the user is signed in or out. */
	authenticated: BehaviorSubject<AuthenticatedEvent> = new BehaviorSubject(null);

	/** Service that stores data needed by the AuthService */
	store: WebStorageService;

	constructor (
		private router: Router,
		@Inject(AUTH_WEB_STORAGE_SERVICE) private _webStorageService: WebStorageService
	) {
		this.store = _webStorageService;

		let user = this.store.get(this.USER_STORE_KEY);
		this.authenticated.next(new AuthenticatedEvent(user != null, user));
	}

	login(username: string, password: string): boolean {
		if (username === 'admin' && password === 'password') {

			// Get the user
			let user = new User();
			user.id = new Date().getTime();
			user.firstName = 'John';
			user.lastName = new Date().getTime().toString();
			user.title = 'Janitor';

			this.store.set(this.USER_STORE_KEY, user);

			this.authenticated.next(new AuthenticatedEvent(true, user));

			return true;
		}

		return false;
	}

	logout(): any {
		this.store.remove(this.USER_STORE_KEY);
		this.authenticated.next(new AuthenticatedEvent(false));
	}

	isAuthenticated(): boolean {
		return this.authenticated.value.authenticated && this.getUser() != null;
	}

	getUser(): any {
		let user = this.store.get(this.USER_STORE_KEY);

		if (user === null) {
			if(this.authenticated.value.authenticated) {
				this.logout();
			}

			return null;
		}

		return user;
	}

	navigateToLogin(): void {
		this.router.navigate(['/login']);
	}
}



export const AUTH_SERVICE_PROVIDERS: Array<any> = [
	{ provide: AuthService, useClass: AuthService }
];
