import { NgModule } from '@angular/core';
import { 
	LocalStorageService,
	StorageModule,
	WebStorageService
} from '@app/core/storage';
import { AnonymousGuard } from './anonymous.guard';
import { AuthGuard } from './auth.guard';
import { AuthService, AUTH_SERVICE_PROVIDERS } from './auth.service';
import { AUTH_WEB_STORAGE_SERVICE } from './auth-web-storage-service.token';



@NgModule({
	imports: [
		StorageModule
	],
	exports: [
		StorageModule
	],
	providers: [
		AnonymousGuard,
		AuthGuard,
		AUTH_SERVICE_PROVIDERS,
		{ provide: AUTH_WEB_STORAGE_SERVICE, useClass: LocalStorageService }
	]
})
export class AuthModule { }