import { Injectable } from '@angular/core';
import {
	CanActivate,
	CanActivateChild,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { AuthenticatedEvent } from '@app/core';
import { map } from 'rxjs/operators';



@Injectable()
export class AnonymousGuard implements CanActivate, CanActivateChild {
	constructor (
		private auth: AuthService,
		private router: Router
	) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		if(this.auth.isAuthenticated()) {
			this.router.navigate(['/']);
			return false;
		}

		return true;
	}	

	canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return this.canActivate(route, state);
	}
}