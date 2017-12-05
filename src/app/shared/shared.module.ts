import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UIModule } from '@app/lib/ui';
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
		UIModule
	],
	exports: [
		RouterModule
	],
	declarations: [
		NotFoundComponent,
		ForbiddenComponent,
		UnauthorizedComponent,
		InternalServerErrorComponent
	]
})
export class SharedModule { }
