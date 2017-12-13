import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@app/core/a11y';
import { UNIQUE_SELECTION_DISPATCHER_SERVICE_PROVIDER } from '@app/core/collections';
import { VIEWPORT_RULER_PROVIDER } from '@app/core/layout';
import { RadioButtonComponent, RadioGroupDirective } from './radio-button.component';


@NgModule({
	imports: [
		CommonModule,
		A11yModule
	],
	exports: [
		RadioButtonComponent,
		RadioGroupDirective
	],
	providers: [
		UNIQUE_SELECTION_DISPATCHER_SERVICE_PROVIDER,
		VIEWPORT_RULER_PROVIDER
	],
	declarations: [
		RadioButtonComponent,
		RadioGroupDirective
	]
})
export class RadioModule { }
