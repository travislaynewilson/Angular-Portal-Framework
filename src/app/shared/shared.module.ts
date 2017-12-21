import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LibModule } from '@app/lib';
import { LoaderModule } from '@app/core';
import {
	ForbiddenComponent,
	InternalServerErrorComponent,
	NotFoundComponent,
	UnauthorizedComponent
} from './errors';
import { RouteCollection } from './shared.routing';
import { SecureLayoutComponent } from './layouts/secure-layout/secure-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';



@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(RouteCollection),
		LibModule,
		LoaderModule
	],
	exports: [
		RouterModule,
		LibModule
	],
	declarations: [
		ForbiddenComponent,
		InternalServerErrorComponent,
		NotFoundComponent,
		PublicLayoutComponent,
		SecureLayoutComponent,
		UnauthorizedComponent
	]
})
export class SharedModule { }
