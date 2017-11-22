import {NgModule, Provider} from '@angular/core';
import {
	PortalModule, 
	ScrollingModule, 
	VIEWPORT_RULER_PROVIDER
} from '@app/core';

import {OverlayService} from './overlay.service';
import {OVERLAY_CONTAINER_SERVICE_PROVIDER} from './overlay-container.service';
import {ConnectedOverlayDirective, APP_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER} from './connected-overlay.directive';
import {OverlayOriginDirective} from './overlay-origin.directive';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {OVERLAY_KEYBOARD_DISPATCHER_SERVICE_PROVIDER} from './keyboard/overlay-keyboard-dispatcher.service';
import {ScrollStrategyOptions} from './scroll/scroll-strategy-options';

export const OVERLAY_PROVIDERS: Provider[] = [
	OverlayService,
  OverlayPositionBuilder,
  OVERLAY_KEYBOARD_DISPATCHER_SERVICE_PROVIDER,
  VIEWPORT_RULER_PROVIDER,
  OVERLAY_CONTAINER_SERVICE_PROVIDER,
  APP_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
];

@NgModule({
	imports: [
	  PortalModule,
	  ScrollingModule
	],
	exports: [
	  ConnectedOverlayDirective,
	  OverlayOriginDirective,
	  ScrollingModule
	],
	declarations: [ConnectedOverlayDirective, OverlayOriginDirective],
	providers: [OVERLAY_PROVIDERS, ScrollStrategyOptions]
  })
  export class OverlayModule {}
  