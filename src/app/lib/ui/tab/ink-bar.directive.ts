import { Directive, Renderer2, ElementRef, NgZone } from '@angular/core';



/** The ink-bar is used to display and animate the line underneath the current active tab label.  */
@Directive({
	selector: 'app-ink-bar',
	host: {
		'class': 'app-ink-bar'
	}
})
export class InkBarDirective {
	constructor (
		private _renderer: Renderer2,
		private _elementRef: ElementRef,
		private _ngZone: NgZone) { }

	/**
	 * Calculates the styles from the provided element in order to align the ink-bar to that element.
	 * Shows the ink bar if previously set as hidden.
	 * @param element
	 */
	alignToElement (element: HTMLElement) {
		this.show();

		if (typeof requestAnimationFrame !== 'undefined') {
			this._ngZone.runOutsideAngular(() => {
				requestAnimationFrame(() => this._setStyles(element));
			});
		} else {
			this._setStyles(element);
		}
	}

	/** Shows the ink bar. */
	show (): void {
		this._renderer.setStyle(this._elementRef.nativeElement, 'visibility', 'visible');
	}

	/** Hides the ink bar. */
	hide (): void {
		this._renderer.setStyle(this._elementRef.nativeElement, 'visibility', 'hidden');
	}

	/**
	 * Sets the proper styles to the ink bar element.
	 * @param element
	 */
	private _setStyles (element: HTMLElement) {
		const left = element ? (element.offsetLeft || 0) + 'px' : '0';
		const width = element ? (element.offsetWidth || 0) + 'px' : '0';

		this._renderer.setStyle(this._elementRef.nativeElement, 'left', left);
		this._renderer.setStyle(this._elementRef.nativeElement, 'width', width);
	}
}
