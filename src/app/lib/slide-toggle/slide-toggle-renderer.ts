import { ElementRef } from '@angular/core';
import { applyCssTransform, Platform } from '@app/cdk';



/**
 * Renderer for the Slide Toggle component, which separates DOM modification in its own class
 */
export class SlideToggleRenderer {

	/** Reference to the thumb HTMLElement. */
	private _thumbEl: HTMLElement;

	/** Reference to the thumb bar HTMLElement. */
	private _thumbBarEl: HTMLElement;

	/** Width of the thumb bar of the slide-toggle. */
	private _thumbBarWidth: number;

	/** Previous checked state before drag started. */
	private _previousChecked: boolean;

	/** Percentage of the thumb while dragging. Percentage as fraction of 100. */
	dragPercentage: number;

	/** Whether the thumb is currently being dragged. */
	dragging: boolean = false;

	constructor (elementRef: ElementRef, platform: Platform) {
		// We only need to interact with these elements when we're on the browser, so only grab
		// the reference in that case.
		if (platform.isBrowser) {
			this._thumbEl = elementRef.nativeElement.querySelector('.app-slide-toggle-thumb-container');
			this._thumbBarEl = elementRef.nativeElement.querySelector('.app-slide-toggle-bar');
		}
	}

	/** Initializes the drag of the slide-toggle. */
	startThumbDrag(checked: boolean) {
		if (this.dragging) { return; }

		this._thumbBarWidth = this._thumbBarEl.clientWidth - this._thumbEl.clientWidth;
		this._thumbEl.classList.add('app-dragging');

		this._previousChecked = checked;
		this.dragging = true;
	}

	/** Resets the current drag and returns the new checked value. */
	stopThumbDrag(): boolean {
		if (!this.dragging) { return false; }

		this.dragging = false;
		this._thumbEl.classList.remove('app-dragging');

		// Reset the transform because the component will take care of the thumb position after drag.
		applyCssTransform(this._thumbEl, '');

		return this.dragPercentage > 50;
	}

	/** Updates the thumb containers position from the specified distance. */
	updateThumbPosition(distance: number) {
		this.dragPercentage = this._getDragPercentage(distance);
		// Calculate the moved distance based on the thumb bar width.
		let dragX = (this.dragPercentage / 100) * this._thumbBarWidth;
		applyCssTransform(this._thumbEl, `translate3d(${dragX}px, 0, 0)`);
	}

	/** Retrieves the percentage of thumb from the moved distance. Percentage as fraction of 100. */
	private _getDragPercentage(distance: number) {
		let percentage = (distance / this._thumbBarWidth) * 100;

		// When the toggle was initially checked, then we have to start the drag at the end.
		if (this._previousChecked) {
			percentage += 100;
		}

		return Math.max(0, Math.min(percentage, 100));
	}
}
