import {Subscription} from 'rxjs/Subscription';
import {ScrollStrategy, getAppScrollStrategyAlreadyAttachedError} from './scroll-strategy';
import {ScrollDispatcherService} from '@app/core';
import {OverlayRef} from '../overlay-ref';

/**
 * Config options for the RepositionScrollStrategy.
 */
export interface RepositionScrollStrategyConfig {
  scrollThrottle?: number;
}

/**
 * Strategy that will update the element position as the user is scrolling.
 */
export class RepositionScrollStrategy implements ScrollStrategy {
  private _scrollSubscription: Subscription|null = null;
  private _overlayRef: OverlayRef;

  constructor(
    private _scrollDispatcher: ScrollDispatcherService,
    private _config?: RepositionScrollStrategyConfig
  ) { }

  /** Attaches this scroll strategy to an overlay. */
  attach(overlayRef: OverlayRef) {
    if (this._overlayRef) {
      throw getAppScrollStrategyAlreadyAttachedError();
    }

    this._overlayRef = overlayRef;
  }

  /** Enables repositioning of the attached overlay on scroll. */
  enable() {
    if (!this._scrollSubscription) {
      let throttle = this._config ? this._config.scrollThrottle : 0;

      this._scrollSubscription = this._scrollDispatcher.scrolled(throttle).subscribe(() => {
        this._overlayRef.updatePosition();
      });
    }
  }

  /** Disables repositioning of the attached overlay on scroll. */
  disable() {
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
      this._scrollSubscription = null;
    }
  }
}
