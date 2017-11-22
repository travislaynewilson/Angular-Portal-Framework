import { InjectionToken } from '@angular/core';
import {
	OverlayService,
	RepositionScrollStrategy,
	ScrollStrategy
} from '@app/core';
import { SCROLL_THROTTLE_MS } from './tooltip-config';


/** Injection token that determines the scroll handling while a tooltip is visible. */
export const APP_TOOLTIP_SCROLL_STRATEGY =
new InjectionToken<() => ScrollStrategy>('app-tooltip-scroll-strategy');

export function APP_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY(overlayService: OverlayService): () => RepositionScrollStrategy {
	return () => overlayService.scrollStrategies.reposition({ scrollThrottle: SCROLL_THROTTLE_MS });
}

export const APP_TOOLTIP_SCROLL_STRATEGY_PROVIDER = {
	provide: APP_TOOLTIP_SCROLL_STRATEGY,
	deps: [OverlayService],
	useFactory: APP_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY
};