import { NgZone } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ScrollDispatcherService } from '@app/cdk/scrolling';
import { ScrollStrategy, getAppScrollStrategyAlreadyAttachedError } from './scroll-strategy';
import { OverlayRef } from '../overlay-ref';



/**
 * Strategy that will close the overlay as soon as the user starts scrolling.
 */
export class CloseScrollStrategy implements ScrollStrategy {
	private _scrollSubscription: Subscription | null = null;
	private _overlayRef: OverlayRef;

	constructor (
		private _scrollDispatcherService: ScrollDispatcherService,
		private _ngZone: NgZone
	) { }

	/** Attaches this scroll strategy to an overlay. */
	attach(overlayRef: OverlayRef) {
		if (this._overlayRef) {
			throw getAppScrollStrategyAlreadyAttachedError();
		}

		this._overlayRef = overlayRef;
	}

	/** Enables the closing of the attached on scroll. */
	enable() {
		if (!this._scrollSubscription) {
			this._scrollSubscription = this._scrollDispatcherService.scrolled(0).subscribe(() => {
				this._ngZone.run(() => {
					this.disable();

					if (this._overlayRef.hasAttached()) {
						this._overlayRef.detach();
					}
				});
			});
		}
	}

	/** Disables the closing the attached overlay on scroll. */
	disable() {
		if (this._scrollSubscription) {
			this._scrollSubscription.unsubscribe();
			this._scrollSubscription = null;
		}
	}
}
