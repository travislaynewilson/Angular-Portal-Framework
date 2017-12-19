import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PlatformModule } from '@app/cdk';
import { FormFieldModule } from '@app/lib/form-field';
import { ErrorStateMatcherService } from '@app/lib/core';
import { TextareaAutosizeDirective } from './textarea-autosize.directive';
import { InputDirective } from './input.directive';



@NgModule({
	imports: [
		CommonModule,
		FormFieldModule,
		PlatformModule
	],
	exports: [
		FormFieldModule,
		InputDirective,
		TextareaAutosizeDirective
	],
	declarations: [
		InputDirective,
		TextareaAutosizeDirective
	],
	providers: [ErrorStateMatcherService]
})
export class InputModule { }