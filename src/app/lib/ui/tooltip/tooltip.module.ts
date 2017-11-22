import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {
	A11yModule,
	PlatformModule
} from '@app/core';

//import {OverlayModule} from '@angular/cdk/overlay';

import { TooltipComponent } from './tooltip.component';
import { TooltipDirective } from './tooltip.directive';
import { APP_TOOLTIP_SCROLL_STRATEGY_PROVIDER } from './tooltip-scroll.strategy';


@NgModule({
	imports: [
	  CommonModule,
	  //OverlayModule,
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
	providers: [APP_TOOLTIP_SCROLL_STRATEGY_PROVIDER]
  })
  export class TooltipModule {}
  