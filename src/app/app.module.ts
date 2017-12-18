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
	LoggingInterceptor
} from '@app/core';
import { SharedModule } from '@app/shared';
import { DemoModule } from '@app/demo';
import { AppComponent } from './app.component';
import { RouteCollection } from './app.routing';



@NgModule({
	declarations: [
		AppComponent
	],
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
		MomentDateModule,
		RouterModule.forRoot(RouteCollection),
		PlatformModule,
		ScrollingModule,
		SharedModule,
		LibModule
	],
	exports: [
		AuthModule,
		ScrollingModule,
		LayoutModule,
		RouterModule,
		LibModule
	],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
		{ provide: DATE_LOCALE, useValue: 'en-US' }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
