/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
	Directive,
	ElementRef,
	EventEmitter,
	Inject,
	InjectionToken,
	Input,
	OnChanges,
	OnDestroy,
	Optional,
	Output,
	Renderer2,
	SimpleChanges,
	TemplateRef,
	ViewContainerRef,
  } from '@angular/core';

import {Subscription} from 'rxjs/Subscription';
import {
	CoercionHelper,
	KeyCodes,
	TemplatePortal
} from '@app/core';

  import {OverlayService} from './overlay.service';
  import {OverlayRef} from './overlay-ref';
  import {OverlayConfig} from './overlay-config';
  import {OverlayOriginDirective} from './overlay-origin.directive';
  import {
	ConnectedOverlayPositionChange,
	ConnectionPositionPair,
  } from './position/connected-position';
  import {ConnectedPositionStrategy} from './position';
  import {RepositionScrollStrategy, ScrollStrategy} from './scroll';
  
  
  /** Default set of positions for the overlay. Follows the behavior of a dropdown. */
  const defaultPositionList = [
	new ConnectionPositionPair(
		{originX: 'start', originY: 'bottom'},
		{overlayX: 'start', overlayY: 'top'}),
	new ConnectionPositionPair(
		{originX: 'start', originY: 'top'},
		{overlayX: 'start', overlayY: 'bottom'}),
  ];
  

  /** Injection token that determines the scroll handling while the connected overlay is open. */
  export const APP_CONNECTED_OVERLAY_SCROLL_STRATEGY =
	  new InjectionToken<() => ScrollStrategy>('cdk-connected-overlay-scroll-strategy');
  
  export function APP_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY(overlayService: OverlayService):
	  () => RepositionScrollStrategy {
	return () => overlayService.scrollStrategies.reposition();
  }
  
  export const APP_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER = {
	provide: APP_CONNECTED_OVERLAY_SCROLL_STRATEGY,
	deps: [OverlayService],
	useFactory: APP_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY,
  };
  
  
  /**
   * Directive to facilitate declarative creation of an Overlay using a ConnectedPositionStrategy.
   */
  @Directive({
	selector: '[app-connected-overlay], [connected-overlay], [appConnectedOverlay]',
	exportAs: 'appConnectedOverlay'
  })
  export class ConnectedOverlayDirective implements OnDestroy, OnChanges {
	private _overlayRef: OverlayRef;
	private _templatePortal: TemplatePortal<any>;
	private _hasBackdrop = false;
	private _backdropSubscription = Subscription.EMPTY;
	private _positionSubscription = Subscription.EMPTY;
	private _offsetX: number = 0;
	private _offsetY: number = 0;
	private _position: ConnectedPositionStrategy;
	private _escapeListener = () => {};
  
	/** Origin for the connected overlay. */
	@Input('cdkConnectedOverlayOrigin') origin: OverlayOriginDirective;
  
	/** Registered connected position pairs. */
	@Input('cdkConnectedOverlayPositions') positions: ConnectionPositionPair[];
  
	/** The offset in pixels for the overlay connection point on the x-axis */
	@Input('cdkConnectedOverlayOffsetX')
	get offsetX(): number { return this._offsetX; }
	set offsetX(offsetX: number) {
	  this._offsetX = offsetX;
	  if (this._position) {
		this._position.withOffsetX(offsetX);
	  }
	}
  
	/** The offset in pixels for the overlay connection point on the y-axis */
	@Input('cdkConnectedOverlayOffsetY')
	get offsetY() { return this._offsetY; }
	set offsetY(offsetY: number) {
	  this._offsetY = offsetY;
	  if (this._position) {
		this._position.withOffsetY(offsetY);
	  }
	}
  
	/** The width of the overlay panel. */
	@Input('cdkConnectedOverlayWidth') width: number | string;
  
	/** The height of the overlay panel. */
	@Input('cdkConnectedOverlayHeight') height: number | string;
  
	/** The min width of the overlay panel. */
	@Input('cdkConnectedOverlayMinWidth') minWidth: number | string;
  
	/** The min height of the overlay panel. */
	@Input('cdkConnectedOverlayMinHeight') minHeight: number | string;
  
	/** The custom class to be set on the backdrop element. */
	@Input('cdkConnectedOverlayBackdropClass') backdropClass: string;
  
	/** Strategy to be used when handling scroll events while the overlay is open. */
	@Input('cdkConnectedOverlayScrollStrategy') scrollStrategy: ScrollStrategy =
		this._scrollStrategy();
  
	/** Whether the overlay is open. */
	@Input('cdkConnectedOverlayOpen') open: boolean = false;
  
	/** Whether or not the overlay should attach a backdrop. */
	@Input('cdkConnectedOverlayHasBackdrop')
	get hasBackdrop() { return this._hasBackdrop; }
	set hasBackdrop(value: any) { this._hasBackdrop = CoercionHelper.coerceBoolean(value); }
      
	/** Event emitted when the backdrop is clicked. */
	@Output() backdropClick = new EventEmitter<void>();
  
	/** Event emitted when the position has changed. */
	@Output() positionChange = new EventEmitter<ConnectedOverlayPositionChange>();
  
	/** Event emitted when the overlay has been attached. */
	@Output() attach = new EventEmitter<void>();
  
	/** Event emitted when the overlay has been detached. */
	@Output() detach = new EventEmitter<void>();
  
	// TODO(jelbourn): inputs for size, scroll behavior, animation, etc.
  
	constructor(
		private _overlayService: OverlayService,
		private _renderer: Renderer2,
		templateRef: TemplateRef<any>,
		viewContainerRef: ViewContainerRef,
		@Inject(APP_CONNECTED_OVERLAY_SCROLL_STRATEGY) private _scrollStrategy) {
	  this._templatePortal = new TemplatePortal(templateRef, viewContainerRef);
	}
  
	/** The associated overlay reference. */
	get overlayRef(): OverlayRef {
	  return this._overlayRef;
	}

  
	ngOnDestroy() {
	  this._destroyOverlay();
	}
  
	ngOnChanges(changes: SimpleChanges) {
	  if (changes['open'] || changes['_deprecatedOpen']) {
		this.open ? this._attachOverlay() : this._detachOverlay();
	  }
	}
  
	/** Creates an overlay */
	private _createOverlay() {
	  if (!this.positions || !this.positions.length) {
		this.positions = defaultPositionList;
	  }
  
	  this._overlayRef = this._overlayService.create(this._buildConfig());
	}
  
	/** Builds the overlay config based on the directive's inputs */
	private _buildConfig(): OverlayConfig {
	  const positionStrategy = this._position = this._createPositionStrategy();
	  const overlayConfig = new OverlayConfig({
		positionStrategy,
		scrollStrategy: this.scrollStrategy,
		hasBackdrop: this.hasBackdrop
	  });
  
	  if (this.width || this.width === 0) {
		overlayConfig.width = this.width;
	  }
  
	  if (this.height || this.height === 0) {
		overlayConfig.height = this.height;
	  }
  
	  if (this.minWidth || this.minWidth === 0) {
		overlayConfig.minWidth = this.minWidth;
	  }
  
	  if (this.minHeight || this.minHeight === 0) {
		overlayConfig.minHeight = this.minHeight;
	  }
  
	  if (this.backdropClass) {
		overlayConfig.backdropClass = this.backdropClass;
	  }
  
	  return overlayConfig;
	}
  
	/** Returns the position strategy of the overlay to be set on the overlay config */
	private _createPositionStrategy(): ConnectedPositionStrategy {
	  const pos = this.positions[0];
	  const originPoint = {originX: pos.originX, originY: pos.originY};
	  const overlayPoint = {overlayX: pos.overlayX, overlayY: pos.overlayY};
  
	  const strategy = this._overlayService.position()
		.connectedTo(this.origin.elementRef, originPoint, overlayPoint)
		.withOffsetX(this.offsetX)
		.withOffsetY(this.offsetY);
  
	  this._handlePositionChanges(strategy);
  
	  return strategy;
	}
  
	private _handlePositionChanges(strategy: ConnectedPositionStrategy): void {
	  for (let i = 1; i < this.positions.length; i++) {
		strategy.withFallbackPosition(
			{originX: this.positions[i].originX, originY: this.positions[i].originY},
			{overlayX: this.positions[i].overlayX, overlayY: this.positions[i].overlayY}
		);
	  }
  
	  this._positionSubscription =
		  strategy.onPositionChange.subscribe(pos => this.positionChange.emit(pos));
	}
  
	/** Attaches the overlay and subscribes to backdrop clicks if backdrop exists */
	private _attachOverlay() {
	  if (!this._overlayRef) {
		this._createOverlay();
	  }
  
	  this._initEscapeListener();
  
	  if (!this._overlayRef.hasAttached()) {
		this._overlayRef.attach(this._templatePortal);
		this.attach.emit();
	  }
  
	  if (this.hasBackdrop) {
		this._backdropSubscription = this._overlayRef.backdropClick().subscribe(() => {
		  this.backdropClick.emit();
		});
	  }
	}
  
	/** Detaches the overlay and unsubscribes to backdrop clicks if backdrop exists */
	private _detachOverlay() {
	  if (this._overlayRef) {
		this._overlayRef.detach();
		this.detach.emit();
	  }
  
	  this._backdropSubscription.unsubscribe();
	  this._escapeListener();
	}
  
	/** Destroys the overlay created by this directive. */
	private _destroyOverlay() {
	  if (this._overlayRef) {
		this._overlayRef.dispose();
	  }
  
	  this._backdropSubscription.unsubscribe();
	  this._positionSubscription.unsubscribe();
	  this._escapeListener();
	}
  
	/** Sets the event listener that closes the overlay when pressing Escape. */
	private _initEscapeListener() {
	  this._escapeListener = this._renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
		if (event.keyCode === KeyCodes.ESCAPE) {
		  this._detachOverlay();
		}
	  });
	}
  }
  