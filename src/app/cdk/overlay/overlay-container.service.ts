import { Injectable, Optional, SkipSelf, OnDestroy } from '@angular/core';



/** Container inside which all overlays will render. */
@Injectable()
export class OverlayContainerService implements OnDestroy {
	protected _containerElement: HTMLElement;

	ngOnDestroy() {
		if (this._containerElement && this._containerElement.parentNode) {
			this._containerElement.parentNode.removeChild(this._containerElement);
		}
	}

	/**
	 * This method returns the overlay container element. It will lazily
	 * create the element the first time  it is called to facilitate using
	 * the container in non-browser environments.
	 * @returns the container element
	 */
	getContainerElement(): HTMLElement {
		if (!this._containerElement) { this._createContainer(); }
		return this._containerElement;
	}

	/**
	 * Create the overlay container element, which is simply a div
	 * with the 'app-overlay-container' class on the document body.
	 */
	protected _createContainer(): void {
		let container = document.createElement('div');
		container.classList.add('app-overlay-container');

		document.body.appendChild(container);
		this._containerElement = container;
	}
}



export function OVERLAY_CONTAINER_SERVICE_PROVIDER_FACTORY(parentContainer: OverlayContainerService) {
	return parentContainer || new OverlayContainerService();
}



export const OVERLAY_CONTAINER_SERVICE_PROVIDER = {
	// If there is already an OverlayContainer available, use that. Otherwise, provide a new one.
	provide: OverlayContainerService,
	deps: [[new Optional(), new SkipSelf(), OverlayContainerService]],
	useFactory: OVERLAY_CONTAINER_SERVICE_PROVIDER_FACTORY
};
