import { Injectable, Optional, SkipSelf, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { filter } from 'rxjs/operators/filter';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { OverlayRef } from '../overlay-ref';



/**
 * Service for dispatching keyboard events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
@Injectable()
export class OverlayKeyboardDispatcherService implements OnDestroy {

	/** Currently attached overlays in the order they were attached. */
	_attachedOverlays: OverlayRef[] = [];

	private _keydownEventSubscription: Subscription | null;

	ngOnDestroy() {
		if (this._keydownEventSubscription) {
			this._keydownEventSubscription.unsubscribe();
			this._keydownEventSubscription = null;
		}
	}

	/** Add a new overlay to the list of attached overlay refs. */
	add(overlayRef: OverlayRef): void {
		// Lazily start dispatcher once first overlay is added
		if (!this._keydownEventSubscription) {
			this._subscribeToKeydownEvents();
		}

		this._attachedOverlays.push(overlayRef);
	}

	/** Remove an overlay from the list of attached overlay refs. */
	remove(overlayRef: OverlayRef): void {
		const index = this._attachedOverlays.indexOf(overlayRef);
		if (index > -1) {
			this._attachedOverlays.splice(index, 1);
		}
	}

	/**
	 * Subscribe to keydown events that land on the body and dispatch those
	 * events to the appropriate overlay.
	 */
	private _subscribeToKeydownEvents(): void {
		const bodyKeydownEvents = fromEvent<KeyboardEvent>(document.body, 'keydown');

		this._keydownEventSubscription = bodyKeydownEvents.pipe(
			filter(() => !!this._attachedOverlays.length)
		).subscribe(event => {
			// Dispatch keydown event to correct overlay reference
			this._selectOverlayFromEvent(event)._keydownEvents.next(event);
		});
	}

	/** Select the appropriate overlay from a keydown event. */
	private _selectOverlayFromEvent(event: KeyboardEvent): OverlayRef {
		// Check if any overlays contain the event
		const targetedOverlay = this._attachedOverlays.find(overlay => {
			return overlay.overlayElement === event.target ||
				overlay.overlayElement.contains(event.target as HTMLElement);
		});

		// Use that overlay if it exists, otherwise choose the most recently attached one
		return targetedOverlay || this._attachedOverlays[this._attachedOverlays.length - 1];
	}

}



export function OVERLAY_KEYBOARD_DISPATCHER_SERVICE_PROVIDER_FACTORY(
	dispatcher: OverlayKeyboardDispatcherService) {
	return dispatcher || new OverlayKeyboardDispatcherService();
}



export const OVERLAY_KEYBOARD_DISPATCHER_SERVICE_PROVIDER = {
	// If there is already an OverlayKeyboardDispatcherService available, use that.
	// Otherwise, provide a new one.
	provide: OverlayKeyboardDispatcherService,
	deps: [[new Optional(), new SkipSelf(), OverlayKeyboardDispatcherService]],
	useFactory: OVERLAY_KEYBOARD_DISPATCHER_SERVICE_PROVIDER_FACTORY
};
