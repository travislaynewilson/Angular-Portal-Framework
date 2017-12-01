import { NgZone, Injectable } from '@angular/core';
import { Platform } from '@app/core/platform';
import { InteractivityCheckerUtility } from './interactivity-checker.utility';
import { FocusTrap } from './focus-trap';



/** Factory that allows easy instantiation of focus traps. */
@Injectable()
export class FocusTrapFactory {
	constructor (
		private _checker: InteractivityCheckerUtility,
		private _platform: Platform,
		private _ngZone: NgZone) { }

	/**
	 * Creates a focus-trapped region around the given element.
	 * @param element The element around which focus will be trapped.
	 * @param deferCaptureElements Defers the creation of focus-capturing elements to be done
	 *     manually by the user.
	 * @returns The created focus trap instance.
	 */
	create (element: HTMLElement, deferCaptureElements: boolean = false): FocusTrap {
		return new FocusTrap(
			element, this._platform, this._checker, this._ngZone, deferCaptureElements);
	}
}