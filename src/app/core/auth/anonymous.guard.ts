import { Injectable } from '@angular/core';
import {
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { AuthenticatedEvent } from '@app/core';
import { map } from 'rxjs/operators';



@Injectable()
export class AnonymousGuard implements CanActivate {
	constructor (
		private auth: AuthService,
		private router: Router
	) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		if(this.auth.authenticated.value.authenticated) {
			this.router.navigate(['/']);
			return false;
		}

		return true;
	}
}