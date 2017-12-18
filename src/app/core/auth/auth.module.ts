import { NgModule } from '@angular/core';
import { AuthGuard } from './auth.guard';
import { AuthService, AUTH_SERVICE_PROVIDERS } from './auth.service';



@NgModule({
	providers: [
		AuthGuard,
		AUTH_SERVICE_PROVIDERS
	]
})
export class AuthModule { }