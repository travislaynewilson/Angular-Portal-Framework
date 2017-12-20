import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { WebStorageService } from '@app/core/storage';
import { AUTH_WEB_STORAGE_SERVICE } from './auth-web-storage-service.token';
import { User } from './user';



/** Describes an event emitted when a user is signed in or out */
export class AuthenticatedEvent {
	constructor(
		public authenticated: boolean, 
		public user?: User | null) {}
};



@Injectable()
export class AuthService {

	private readonly USER_STORE_KEY: string = 'user';

	/** Emits whenever the user is signed in or out. */
	authenticated: BehaviorSubject<AuthenticatedEvent> = new BehaviorSubject(null);

	/** Service that stores data needed by the AuthService */
	store: WebStorageService;

	constructor (
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

	getUser(): any {
		let user = this.store.get(this.USER_STORE_KEY);
		
		if(user === null) {
			this.logout();
			return null;
		}

		return user;
	}
}



export const AUTH_SERVICE_PROVIDERS: Array<any> = [
	{ provide: AuthService, useClass: AuthService }
];
