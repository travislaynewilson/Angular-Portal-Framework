import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PlatformModule } from '@app/cdk';
import { ErrorDirective } from './error.directive';
import { FormFieldComponent } from './form-field/form-field.component';
import { HintDirective } from './hint.directive';
import { PlaceholderDirective } from './placeholder.directive';
import { PrefixDirective } from './prefix.directive';
import { SuffixDirective } from './suffix.directive';



@NgModule({
	declarations: [
		ErrorDirective,
		HintDirective,
		FormFieldComponent,
		PlaceholderDirective,
		PrefixDirective,
		SuffixDirective
	],
	imports: [
		CommonModule,
		PlatformModule
	],
	exports: [
		ErrorDirective,
		HintDirective,
		FormFieldComponent,
		PlaceholderDirective,
		PrefixDirective,
		SuffixDirective
	],
})
export class FormFieldModule { }
