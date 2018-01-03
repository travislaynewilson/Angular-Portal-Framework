import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '@app/lib/button';
import { IconModule } from '@app/lib/icon';
import { SelectModule } from '@app/lib/select';
import { TooltipModule } from '@app/lib/tooltip';
import { PaginatorComponent } from './paginator.component';



@NgModule({
	imports: [
		CommonModule,
		ButtonModule,
		IconModule,
		SelectModule,
		TooltipModule,
	],
	exports: [
		PaginatorComponent
	],
	declarations: [
		PaginatorComponent
	]
})
export class PaginatorModule { }
