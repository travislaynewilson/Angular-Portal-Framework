import {
	ComponentFactoryResolver,
	Injectable,
	ApplicationRef,
	Injector,
	NgZone,
} from '@angular/core';
import { DomPortalOutlet } from '@app/cdk/portal';
import { OverlayConfig } from './overlay-config';
import { OverlayRef } from './overlay-ref';
import { OverlayPositionBuilder } from './position/overlay-position-builder';
import { OverlayKeyboardDispatcherService } from './keyboard/overlay-keyboard-dispatcher.service';
import { OverlayContainerService } from './overlay-container.service';
import { ScrollStrategyOptions } from './scroll';



/** Next overlay unique ID. */
let nextUniqueId = 0;



/** The default config for newly created overlays. */
let defaultConfig = new OverlayConfig();



/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalOutlet, so any kind of Portal can be loaded into one.
 */
@Injectable()
export class OverlayService {
	constructor (
		/** Scrolling strategies that can be used when creating an overlay. */
		public scrollStrategies: ScrollStrategyOptions,
		private _overlayContainerService: OverlayContainerService,
		private _componentFactoryResolver: ComponentFactoryResolver,
		private _positionBuilder: OverlayPositionBuilder,
		private _keyboardDispatcherService: OverlayKeyboardDispatcherService,
		private _appRef: ApplicationRef,
		private _injector: Injector,
		private _ngZone: NgZone) { }

	/**
	 * Creates an overlay.
	 * @param config Configuration applied to the overlay.
	 * @returns Reference to the created overlay.
	 */
	create(config: OverlayConfig = defaultConfig): OverlayRef {
		const pane = this._createPaneElement();
		const portalOutlet = this._createPortalOutlet(pane);
		return new OverlayRef(portalOutlet, pane, config, this._ngZone, this._keyboardDispatcherService);
	}

	/**
	 * Gets a position builder that can be used, via fluent API,
	 * to construct and configure a position strategy.
	 * @returns An overlay position builder.
	 */
	position(): OverlayPositionBuilder {
		return this._positionBuilder;
	}

	/**
	 * Creates the DOM element for an overlay and appends it to the overlay container.
	 * @returns Newly-created pane element
	 */
	private _createPaneElement(): HTMLElement {
		let pane = document.createElement('div');

		pane.id = `app-overlay-${nextUniqueId++}`;
		pane.classList.add('app-overlay-pane');
		this._overlayContainerService.getContainerElement().appendChild(pane);

		return pane;
	}

	/**
	 * Create a DomPortalOutlet into which the overlay content can be loaded.
	 * @param pane The DOM element to turn into a portal outlet.
	 * @returns A portal outlet for the given DOM element.
	 */
	private _createPortalOutlet(pane: HTMLElement): DomPortalOutlet {
		return new DomPortalOutlet(pane, this._componentFactoryResolver, this._appRef, this._injector);
	}

}
