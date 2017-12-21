import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
	DATE_LOCALE,
	LayoutModule,
	MomentDateModule,
	PlatformModule,
	ScrollingModule
} from '@app/cdk';
import { LibModule } from '@app/lib';
import {
	ApiModule,
	AuthModule,
	LoaderInterceptor,
	LoaderModule,
	LoggingInterceptor,
	StorageModule
} from '@app/core';
import { SharedModule } from '@app/shared';
import { DemoModule } from '@app/demo';
import { LoginModule } from '@app/login';
import { AppComponent } from './app.component';
import { RouteCollection } from './app.routing';



@NgModule({
	imports: [
		ApiModule,
		AuthModule,
		BrowserModule,
		BrowserAnimationsModule,
		DemoModule,
		FormsModule,
		HttpClientModule,
		LayoutModule,
		LoaderModule,
		LoginModule,
		MomentDateModule,
		RouterModule.forRoot(RouteCollection),
		PlatformModule,
		ScrollingModule,
		SharedModule,
		StorageModule,
		LibModule
	],
	exports: [
		AuthModule,
		ScrollingModule,
		LayoutModule,
		LibModule,
		RouterModule
	],
	declarations: [
		AppComponent
	],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
		{ provide: DATE_LOCALE, useValue: 'en-US' }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
