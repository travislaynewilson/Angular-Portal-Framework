import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@app/cdk';
import { FormFieldModule } from '@app/lib/form-field';
import { ErrorStateMatcherService, OptionModule } from '@app/lib/core';
import { SelectComponent } from './select.component';
import { SelectTriggerDirective } from './select-trigger.directive';
import { SELECT_SCROLL_STRATEGY_PROVIDER } from './select-scroll.strategy';



@NgModule({
	imports: [
		CommonModule,
		OverlayModule,
		OptionModule
	],
	exports: [
		FormFieldModule,
		SelectComponent,
		SelectTriggerDirective,
		OptionModule
	],
	declarations: [
		SelectComponent,
		SelectTriggerDirective
	],
	providers: [
		SELECT_SCROLL_STRATEGY_PROVIDER,
		ErrorStateMatcherService
	]
})
export class SelectModule { }
