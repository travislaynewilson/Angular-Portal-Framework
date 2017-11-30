import { InjectionToken } from '@angular/core';
import { OverlayService, RepositionScrollStrategy, ScrollStrategy } from '@app/core/overlay';


/** Injection token that determines the scroll handling while the menu is open. */
export const MENU_SCROLL_STRATEGY =
  new InjectionToken < () => ScrollStrategy > ('menu-scroll-strategy');

/** @docs-private */
export function MENU_SCROLL_STRATEGY_PROVIDER_FACTORY(overlayService: OverlayService):
() => RepositionScrollStrategy {
  return () => overlayService.scrollStrategies.reposition();
}

/** @docs-private */
export const MENU_SCROLL_STRATEGY_PROVIDER = {
  provide: MENU_SCROLL_STRATEGY,
  deps: [OverlayService],
  useFactory: MENU_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
