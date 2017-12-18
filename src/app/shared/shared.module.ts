import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LibModule } from '@app/lib';
import {
	ForbiddenComponent,
	InternalServerErrorComponent,
	NotFoundComponent,
	UnauthorizedComponent
} from './errors';
import { RouteCollection } from './shared.routing';



@NgModule({
	imports: [
		CommonModule,
		RouterModule.forRoot(RouteCollection),
		LibModule
	],
	exports: [
		RouterModule,
		LibModule
	],
	declarations: [
		NotFoundComponent,
		ForbiddenComponent,
		UnauthorizedComponent,
		InternalServerErrorComponent
	]
})
export class SharedModule { }
