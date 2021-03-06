import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	A11yModule,
	OverlayModule,
	PlatformModule
} from '@app/cdk';
import { TooltipComponent } from './tooltip.component';
import { TooltipDirective } from './tooltip.directive';
import { TOOLTIP_SCROLL_STRATEGY_PROVIDER } from './tooltip-scroll.strategy';



@NgModule({
	imports: [
		A11yModule,
		CommonModule,
		OverlayModule,
		PlatformModule
	],
	exports: [
		TooltipComponent,
		TooltipDirective
	],
	declarations: [
		TooltipComponent,
		TooltipDirective
	],
	entryComponents: [TooltipComponent],
	providers: [TOOLTIP_SCROLL_STRATEGY_PROVIDER]
})
export class TooltipModule { }
