import {
	InjectionToken
} from '@angular/core';
import {
	OverlayService,
	RepositionScrollStrategy,
	ScrollStrategy
} from '@app/cdk';



/** Injection token that determines the scroll handling while the calendar is open. */
export const DATEPICKER_SCROLL_STRATEGY =
	new InjectionToken<() => ScrollStrategy>('datepicker-scroll-strategy');



export function DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY(overlayService: OverlayService):
	() => RepositionScrollStrategy {
	return () => overlayService.scrollStrategies.reposition();
}



export const DATEPICKER_SCROLL_STRATEGY_PROVIDER = {
	provide: DATEPICKER_SCROLL_STRATEGY,
	deps: [OverlayService],
	useFactory: DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY
};