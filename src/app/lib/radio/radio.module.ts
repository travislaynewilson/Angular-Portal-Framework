import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	A11yModule,
	VIEWPORT_SERVICE_PROVIDER,
	UNIQUE_SELECTION_DISPATCHER_SERVICE_PROVIDER
} from '@app/cdk';
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
		VIEWPORT_SERVICE_PROVIDER
	],
	declarations: [
		RadioButtonComponent,
		RadioGroupDirective
	]
})
export class RadioModule { }
