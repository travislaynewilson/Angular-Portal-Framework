import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObserversModule } from '@app/core/observers';
import { A11yModule } from '@app/core/a11y';
import { CheckboxComponent } from './checkbox.component';
import { CheckboxRequiredValidatorDirective } from './checkbox-required-validator.directive';



@NgModule({
	imports: [
		CommonModule,
		ObserversModule,
		A11yModule
	],
	exports: [
		CheckboxComponent,
		CheckboxRequiredValidatorDirective
	],
	declarations: [
		CheckboxComponent,
		CheckboxRequiredValidatorDirective
	]
})
export class CheckboxModule { }
