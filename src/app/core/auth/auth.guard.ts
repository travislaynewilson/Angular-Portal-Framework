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
export class AuthGuard implements CanActivate {
	constructor (
		private auth: AuthService,
		private router: Router
	) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		if(!this.auth.getUser()) {
			this.router.navigate(['/error/401']);
			return false;
		}

		return true;
	}
}