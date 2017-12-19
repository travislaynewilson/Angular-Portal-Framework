import { InjectionToken } from '@angular/core';
import {
	OverlayService,
	RepositionScrollStrategy,
	ScrollStrategy
} from '@app/cdk';



/** Injection token that determines the scroll handling while a select is open. */
export const SELECT_SCROLL_STRATEGY =
	new InjectionToken<() => ScrollStrategy>('select-scroll-strategy');



export function SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY(overlayService: OverlayService):
	() => RepositionScrollStrategy {
	return () => overlayService.scrollStrategies.reposition();
}



export const SELECT_SCROLL_STRATEGY_PROVIDER = {
	provide: SELECT_SCROLL_STRATEGY,
	deps: [OverlayService],
	useFactory: SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY
};