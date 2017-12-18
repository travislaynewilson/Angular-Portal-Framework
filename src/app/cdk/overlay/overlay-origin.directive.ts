import { Directive, ElementRef } from '@angular/core';



/**
 * Directive applied to an element to make it usable as an origin for an Overlay using a
 * ConnectedPositionStrategy.
 */
@Directive({
	selector: '[appOverlayOrigin]',
	exportAs: 'appOverlayOrigin',
})
export class OverlayOriginDirective {
	constructor (
		/** Reference to the element on which the directive is applied. */
		public elementRef: ElementRef) { }
}

