import {
	Directive,
	ElementRef,
	Input,
	NgZone,
	OnDestroy,
	AfterContentInit,
	Injectable,
} from '@angular/core';
import { first } from 'rxjs/operators/first';
import { CoercionHelper } from '@app/cdk/helpers';
import { Platform } from '@app/cdk/platform';
import { InteractivityCheckerUtility } from './interactivity-checker.utility';
import { FocusTrap } from './focus-trap';
import { FocusTrapFactory } from './focus-trap.factory';



/** Directive for trapping focus within a region. */
@Directive({
	selector: '[appTrapFocus]',
	exportAs: 'appTrapFocus'
})
export class TrapFocusDirective implements OnDestroy, AfterContentInit {

	/** Underlying FocusTrap instance. */
	focusTrap: FocusTrap;

	/** Previously focused element to restore focus to upon destroy when using autoCapture. */
	private _previouslyFocusedElement: HTMLElement | null = null;

	/** Whether the focus trap is active. */
	@Input('appTrapFocus')
	get enabled(): boolean { return this.focusTrap.enabled; }
	set enabled(value: boolean) { this.focusTrap.enabled = CoercionHelper.coerceBoolean(value); }

	/**
	 * Whether the directive should automatially move focus into the trapped region upon
	 * initialization and return focus to the previous activeElement upon destruction.
	 */
	@Input('appTrapFocusAutoCapture')
	get autoCapture(): boolean { return this._autoCapture; }
	set autoCapture(value: boolean) { this._autoCapture = CoercionHelper.coerceBoolean(value); }
	private _autoCapture: boolean;

	constructor (
		private _elementRef: ElementRef,
		private _focusTrapFactory: FocusTrapFactory,
		private _platform: Platform) {
		this.focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement, true);
	}

	ngOnDestroy() {
		this.focusTrap.destroy();

		// If we stored a previously focused element when using autoCapture, return focus to that
		// element now that the trapped region is being destroyed.
		if (this._previouslyFocusedElement) {
			this._previouslyFocusedElement.focus();
			this._previouslyFocusedElement = null;
		}
	}

	ngAfterContentInit() {
		this.focusTrap.attachAnchors();

		if (this.autoCapture && this._platform.isBrowser) {
			this._previouslyFocusedElement = document.activeElement as HTMLElement;
			this.focusTrap.focusInitialElementWhenReady();
		}
	}
}
