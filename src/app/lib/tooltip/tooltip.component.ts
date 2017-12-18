import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ViewEncapsulation,
} from '@angular/core';
import {
	animate,
	AnimationEvent,
	state,
	style,
	transition,
	trigger
} from '@angular/animations';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ConnectionPositionPair } from '@app/cdk';
import {
	getAppTooltipInvalidPositionError,
	TooltipPosition,
	TooltipVisibility
} from './tooltip-config';



/** Internal component that wraps the tooltip's content. */
@Component({
	selector: 'app-tooltip',
	templateUrl: './tooltip.component.html',
	styleUrls: ['./tooltip.component.scss'],
	animations: [
		trigger('state', [
			state('initial, void, hidden', style({ transform: 'scale(0)' })),
			state('visible', style({ transform: 'scale(1)' })),
			transition('* => visible', animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
			transition('* => hidden', animate('150ms cubic-bezier(0.4, 0.0, 1, 1)')),
		])
	],
	host: {
		// Forces the element to have a layout in IE and Edge. This fixes issues where the element
		// won't be rendered if the animations are disabled or there is no web animations polyfill.
		'[style.zoom]': '_visibility === "visible" ? 1 : null',
		'(body:click)': 'this._handleBodyInteraction()',
		'aria-hidden': 'true'
	},
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	preserveWhitespaces: false
})
export class TooltipComponent {
	/** Message to display in the tooltip */
	message: string;

	/** Classes to be added to the tooltip. Supports the same syntax as `ngClass`. */
	tooltipClass: string | string[] | Set<string> | { [key: string]: any };

	/** The timeout ID of any current timer set to show the tooltip */
	_showTimeoutId: number;

	/** The timeout ID of any current timer set to hide the tooltip */
	_hideTimeoutId: number;

	/** Property watched by the animation framework to show or hide the tooltip */
	_visibility: TooltipVisibility = 'initial';

	/** Whether interactions on the page should close the tooltip */
	private _closeOnInteraction: boolean = false;

	/** The transform origin used in the animation for showing and hiding the tooltip */
	_transformOrigin: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

	/** Current position of the tooltip. */
	private _position: TooltipPosition;

	/** Subject for notifying that the tooltip has been hidden from the view */
	private _onHide: Subject<any> = new Subject();

	constructor (private _changeDetectorRef: ChangeDetectorRef) { }

	/**
	 * Shows the tooltip with an animation originating from the provided origin
	 * @param position Position of the tooltip.
	 * @param delay Amount of milliseconds to the delay showing the tooltip.
	 */
	show(position: TooltipPosition, delay: number): void {
		// Cancel the delayed hide if it is scheduled
		if (this._hideTimeoutId) {
			clearTimeout(this._hideTimeoutId);
		}

		// Body interactions should cancel the tooltip if there is a delay in showing.
		this._closeOnInteraction = true;
		this._position = position;
		this._showTimeoutId = setTimeout(() => {
			this._visibility = 'visible';

			// Mark for check so if any parent component has set the
			// ChangeDetectionStrategy to OnPush it will be checked anyways
			this._markForCheck();
		}, delay);
	}

	/**
	 * Begins the animation to hide the tooltip after the provided delay in ms.
	 * @param delay Amount of milliseconds to delay showing the tooltip.
	 */
	hide(delay: number): void {
		// Cancel the delayed show if it is scheduled
		if (this._showTimeoutId) {
			clearTimeout(this._showTimeoutId);
		}

		this._hideTimeoutId = setTimeout(() => {
			this._visibility = 'hidden';

			// Mark for check so if any parent component has set the
			// ChangeDetectionStrategy to OnPush it will be checked anyways
			this._markForCheck();
		}, delay);
	}

	/** Returns an observable that notifies when the tooltip has been hidden from view. */
	afterHidden(): Observable<void> {
		return this._onHide.asObservable();
	}

	/** Whether the tooltip is being displayed. */
	isVisible(): boolean {
		return this._visibility === 'visible';
	}

	/** Sets the tooltip transform origin according to the position of the tooltip overlay. */
	_setTransformOrigin(overlayPosition: ConnectionPositionPair) {
		const axis = (this._position === 'above' || this._position === 'below') ? 'Y' : 'X';
		const position = axis == 'X' ? overlayPosition.overlayX : overlayPosition.overlayY;

		if (position === 'top' || position === 'bottom') {
			this._transformOrigin = position;
		} else if (position === 'start') {
			this._transformOrigin = 'left';
		} else if (position === 'end') {
			this._transformOrigin = 'right';
		} else {
			throw getAppTooltipInvalidPositionError(this._position);
		}
	}

	_animationStart() {
		this._closeOnInteraction = false;
	}

	_animationDone(event: AnimationEvent): void {
		const toState = event.toState as TooltipVisibility;

		if (toState === 'hidden' && !this.isVisible()) {
			this._onHide.next();
		}

		if (toState === 'visible' || toState === 'hidden') {
			// Note: as of Angular 4.3, the animations module seems to fire the `start` callback before
			// the end if animations are disabled. Make this call async to ensure that it still fires
			// at the appropriate time.
			Promise.resolve().then(() => this._closeOnInteraction = true);
		}
	}

	_handleBodyInteraction(): void {
		if (this._closeOnInteraction) {
			this.hide(0);
		}
	}

	/**
	 * Marks that the tooltip needs to be checked in the next change detection run.
	 * Mainly used for rendering the initial text before positioning a tooltip, which
	 * can be problematic in components with OnPush change detection.
	 */
	_markForCheck(): void {
		this._changeDetectorRef.markForCheck();
	}
}
