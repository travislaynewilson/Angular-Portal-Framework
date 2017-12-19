import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule, ObserversModule } from '@app/cdk';
import { CheckboxComponent } from './checkbox.component';
import { CheckboxGroupDirective } from './checkbox-group.directive';
import { CheckboxRequiredValidatorDirective } from './checkbox-required-validator.directive';



@NgModule({
	imports: [
		CommonModule,
		ObserversModule,
		A11yModule
	],
	exports: [
		CheckboxComponent,
		CheckboxGroupDirective,
		CheckboxRequiredValidatorDirective
	],
	declarations: [
		CheckboxComponent,
		CheckboxGroupDirective,
		CheckboxRequiredValidatorDirective
	]
})
export class CheckboxModule { }
