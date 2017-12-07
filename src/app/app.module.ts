import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ApiModule } from '@app/core/api';
import { LoaderModule } from '@app/core/loader';
import { LayoutModule } from '@app/core/layout';
import { PlatformModule } from '@app/core/platform';
import { LoaderInterceptor } from '@app/core/loader';
import { LoggingInterceptor } from '@app/core/logger';
import { AUTH_PROVIDERS, AuthGuard } from '@app/core/auth';
import { ScrollingModule } from '@app/core/scrolling';

import { SharedModule } from '@app/shared';
import { UIModule } from '@app/lib/ui';
import { ComponentsModule } from '@app/components/components.module';

import { AppComponent } from './app.component'; 
import { RouteCollection } from './app.routing'; 



@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		ApiModule,
		BrowserModule,
		BrowserAnimationsModule,
		ComponentsModule,
		FormsModule,
		HttpClientModule,
		LayoutModule,
		LoaderModule,
		RouterModule.forRoot(RouteCollection),
		PlatformModule,
		ScrollingModule,
		SharedModule,
		UIModule
	],
	exports: [
		ScrollingModule,
		LayoutModule,
		RouterModule
	],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
		AUTH_PROVIDERS,
		AuthGuard
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
