import { NgZone, AfterContentInit, Injectable } from '@angular/core';
import { Platform } from '@app/cdk/platform';
import { first } from 'rxjs/operators/first';
import { InteractivityCheckerUtility } from './interactivity-checker.utility';



/**
 * Class that allows for trapping focus within a DOM element.
 *
 * This class currently uses a relatively simple approach to focus trapping.
 * It assumes that the tab order is the same as DOM order, which is not necessarily true.
 * Things like tabIndex > 0, flex `order`, and shadow roots can cause to two to misalign.
 */
export class FocusTrap {
	private _startAnchor: HTMLElement | null;
	private _endAnchor: HTMLElement | null;

	/** Whether the focus trap is active. */
	get enabled(): boolean { return this._enabled; }
	set enabled(val: boolean) {
		this._enabled = val;

		if (this._startAnchor && this._endAnchor) {
			this._startAnchor.tabIndex = this._endAnchor.tabIndex = this._enabled ? 0 : -1;
		}
	}
	private _enabled: boolean = true;

	constructor (
		private _element: HTMLElement,
		private _platform: Platform,
		private _checker: InteractivityCheckerUtility,
		private _ngZone: NgZone,
		deferAnchors = false) {

		if (!deferAnchors) {
			this.attachAnchors();
		}
	}

	/** Destroys the focus trap by cleaning up the anchors. */
	destroy() {
		if (this._startAnchor && this._startAnchor.parentNode) {
			this._startAnchor.parentNode.removeChild(this._startAnchor);
		}

		if (this._endAnchor && this._endAnchor.parentNode) {
			this._endAnchor.parentNode.removeChild(this._endAnchor);
		}

		this._startAnchor = this._endAnchor = null;
	}

	/**
	 * Inserts the anchors into the DOM. This is usually done automatically
	 * in the constructor, but can be deferred for cases like directives with `*ngIf`.
	 */
	attachAnchors(): void {
		// If we're not on the browser, there can be no focus to trap.
		if (!this._platform.isBrowser) {
			return;
		}

		if (!this._startAnchor) {
			this._startAnchor = this._createAnchor();
		}

		if (!this._endAnchor) {
			this._endAnchor = this._createAnchor();
		}

		this._ngZone.runOutsideAngular(() => {
			this._startAnchor!.addEventListener('focus', () => {
				this.focusLastTabbableElement();
			});

			this._endAnchor!.addEventListener('focus', () => {
				this.focusFirstTabbableElement();
			});

			if (this._element.parentNode) {
				this._element.parentNode.insertBefore(this._startAnchor!, this._element);
				this._element.parentNode.insertBefore(this._endAnchor!, this._element.nextSibling);
			}
		});
	}

	/**
	 * Waits for the zone to stabilize, then either focuses the first element that the
	 * user specified, or the first tabbable element.
	 * @returns Returns a promise that resolves with a boolean, depending
	 * on whether focus was moved successfuly.
	 */
	focusInitialElementWhenReady(): Promise<boolean> {
		return new Promise<boolean>(resolve => {
			this._executeOnStable(() => resolve(this.focusInitialElement()));
		});
	}

	/**
	 * Waits for the zone to stabilize, then focuses
	 * the first tabbable element within the focus trap region.
	 * @returns Returns a promise that resolves with a boolean, depending
	 * on whether focus was moved successfuly.
	 */
	focusFirstTabbableElementWhenReady(): Promise<boolean> {
		return new Promise<boolean>(resolve => {
			this._executeOnStable(() => resolve(this.focusFirstTabbableElement()));
		});
	}

	/**
	 * Waits for the zone to stabilize, then focuses
	 * the last tabbable element within the focus trap region.
	 * @returns Returns a promise that resolves with a boolean, depending
	 * on whether focus was moved successfuly.
	 */
	focusLastTabbableElementWhenReady(): Promise<boolean> {
		return new Promise<boolean>(resolve => {
			this._executeOnStable(() => resolve(this.focusLastTabbableElement()));
		});
	}

	/**
	 * Get the specified boundary element of the trapped region.
	 * @param bound The boundary to get (start or end of trapped region).
	 * @returns The boundary element.
	 */
	private _getRegionBoundary(bound: 'start' | 'end'): HTMLElement | null {
		if (!this._platform.isBrowser) {
			return null;
		}

		// Contains the deprecated version of selector, for temporary backwards comparability.
		let markers = this._element.querySelectorAll(`[app-focus-region-${bound}], ` +
			`[appFocusRegion${bound}], ` +
			`[app-focus-${bound}]`) as NodeListOf<HTMLElement>;

		for (let i = 0; i < markers.length; i++) {
			if (markers[i].hasAttribute(`app-focus-${bound}`)) {
				console.warn(`Found use of deprecated attribute 'app-focus-${bound}',` +
					` use 'appFocusRegion${bound}' instead.`, markers[i]);
			} else if (markers[i].hasAttribute(`app-focus-region-${bound}`)) {
				console.warn(`Found use of deprecated attribute 'app-focus-region-${bound}',` +
					` use 'appFocusRegion${bound}' instead.`, markers[i]);
			}
		}

		if (bound == 'start') {
			return markers.length ? markers[0] : this._getFirstTabbableElement(this._element);
		}
		return markers.length ?
			markers[markers.length - 1] : this._getLastTabbableElement(this._element);
	}

	/**
	 * Focuses the element that should be focused when the focus trap is initialized.
	 * @returns Whether focus was moved successfuly.
	 */
	focusInitialElement(): boolean {
		if (!this._platform.isBrowser) {
			return false;
		}

		// Contains the deprecated version of selector, for temporary backwards comparability.
		const redirectToElement = this._element.querySelector(`[appFocusInitial]`) as HTMLElement;


		if (redirectToElement) {
			redirectToElement.focus();
			return true;
		}

		return this.focusFirstTabbableElement();
	}

	/**
	 * Focuses the first tabbable element within the focus trap region.
	 * @returns Whether focus was moved successfuly.
	 */
	focusFirstTabbableElement(): boolean {
		const redirectToElement = this._getRegionBoundary('start');

		if (redirectToElement) {
			redirectToElement.focus();
		}

		return !!redirectToElement;
	}

	/**
	 * Focuses the last tabbable element within the focus trap region.
	 * @returns Whether focus was moved successfuly.
	 */
	focusLastTabbableElement(): boolean {
		const redirectToElement = this._getRegionBoundary('end');

		if (redirectToElement) {
			redirectToElement.focus();
		}

		return !!redirectToElement;
	}

	/** Get the first tabbable element from a DOM subtree (inclusive). */
	private _getFirstTabbableElement(root: HTMLElement): HTMLElement | null {
		if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
			return root;
		}

		// Iterate in DOM order. Note that IE doesn't have `children` for SVG so we fall
		// back to `childNodes` which includes text nodes, comments etc.
		let children = root.children || root.childNodes;

		for (let i = 0; i < children.length; i++) {
			let tabbableChild = children[i].nodeType === Node.ELEMENT_NODE ?
				this._getFirstTabbableElement(children[i] as HTMLElement) :
				null;

			if (tabbableChild) {
				return tabbableChild;
			}
		}

		return null;
	}

	/** Get the last tabbable element from a DOM subtree (inclusive). */
	private _getLastTabbableElement(root: HTMLElement): HTMLElement | null {
		if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
			return root;
		}

		// Iterate in reverse DOM order.
		let children = root.children || root.childNodes;

		for (let i = children.length - 1; i >= 0; i--) {
			let tabbableChild = children[i].nodeType === Node.ELEMENT_NODE ?
				this._getLastTabbableElement(children[i] as HTMLElement) :
				null;

			if (tabbableChild) {
				return tabbableChild;
			}
		}

		return null;
	}

	/** Creates an anchor element. */
	private _createAnchor(): HTMLElement {
		let anchor = document.createElement('div');
		anchor.tabIndex = this._enabled ? 0 : -1;
		anchor.classList.add('app-visually-hidden');
		anchor.classList.add('app-focus-trap-anchor');
		return anchor;
	}

	/** Executes a function when the zone is stable. */
	private _executeOnStable(fn: () => any): void {
		if (this._ngZone.isStable) {
			fn();
		} else {
			this._ngZone.onStable.asObservable().pipe(first()).subscribe(fn);
		}
	}
}