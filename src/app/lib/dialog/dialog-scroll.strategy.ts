import { InjectionToken } from '@angular/core';
import { BlockScrollStrategy, OverlayService, ScrollStrategy } from '@app/cdk';



/** Injection token that determines the scroll handling while the dialog is open. */
export const DIALOG_SCROLL_STRATEGY =
	new InjectionToken<() => ScrollStrategy>('dialog-scroll-strategy');



export function DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(overlayService: OverlayService):
	() => BlockScrollStrategy {
	return () => overlayService.scrollStrategies.block();
}



export const DIALOG_SCROLL_STRATEGY_PROVIDER = {
	provide: DIALOG_SCROLL_STRATEGY,
	deps: [OverlayService],
	useFactory: DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
