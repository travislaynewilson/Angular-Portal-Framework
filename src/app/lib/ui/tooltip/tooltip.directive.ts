import {
  Directive,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Renderer2,
  ViewContainerRef
} from '@angular/core';

import {first} from 'rxjs/operators/first';
import {merge} from 'rxjs/observable/merge';

import {
  CoercionHelper,
  FocusMonitorService,
  KeyCodes,
  Platform,
  ScrollDispatcherService
} from '@app/core';

import { 
  getAppTooltipInvalidPositionError,
  SCROLL_THROTTLE_MS,
  TooltipPosition,
  TOUCHEND_HIDE_DELAY,
  TOOLTIP_PANEL_CLASS
 } from './tooltip-config';

 import { TOOLTIP_SCROLL_STRATEGY } from './tooltip-scroll.strategy';

import { TooltipComponent } from './tooltip.component';

 import {
  ComponentPortal,
   ConnectionPositionPair,
   HorizontalConnectionPos,
   OriginConnectionPosition,
   OverlayService,
   OverlayConfig,
   OverlayConnectionPosition,
   OverlayRef,
   RepositionScrollStrategy,
   ScrollStrategy,
   VerticalConnectionPos,
 } from '@app/core';


/**
 * Directive that attaches a material design tooltip to the host element. Animates the showing and
 * hiding of a tooltip provided position (defaults to below the element).
 */
@Directive({
  selector: '[appTooltip]',
  exportAs: 'appTooltip',
  host: {
    '(longpress)': 'show()',
    '(keydown)': '_handleKeydown($event)',
    '(touchend)': 'hide(' + TOUCHEND_HIDE_DELAY + ')',
  },
})
export class TooltipDirective implements OnDestroy {
  _overlayRef: OverlayRef | null;
  _tooltipInstance: TooltipComponent | null;

  private _position: TooltipPosition = 'below';
  private _disabled: boolean = false;
  private _tooltipClass: string|string[]|Set<string>|{[key: string]: any};

  /** Allows the user to define the position of the tooltip relative to the parent element */
  @Input('appTooltipPosition')
  get position(): TooltipPosition { return this._position; }
  set position(value: TooltipPosition) {
    if (value !== this._position) {
      this._position = value;

      // TODO(andrewjs): When the overlay's position can be dynamically changed, do not destroy
      // the tooltip.
      if (this._tooltipInstance) {
        this._disposeTooltip();
      }
    }
  }

  /** Disables the display of the tooltip. */
  @Input('appTooltipDisabled')
  get disabled(): boolean { return this._disabled; }
  set disabled(value) {
    this._disabled = CoercionHelper.coerceBoolean(value);

    // If tooltip is disabled, hide immediately.
    if (this._disabled) {
      this.hide(0);
    }
  }

  /** The default delay in ms before showing the tooltip after show is called */
  @Input('appTooltipShowDelay') showDelay = 0;

  /** The default delay in ms before hiding the tooltip after hide is called */
  @Input('appTooltipHideDelay') hideDelay = 0;

  private _message = '';

  /** The message to be displayed in the tooltip */
  @Input('appTooltip') 
  get message() { return this._message; }
  set message(value: string) {

    // If the message is not a string (e.g. number), convert it to a string and trim it.
    this._message = value != null ? `${value}`.trim() : '';
    this._updateTooltipMessage();
  }

  /** Classes to be passed to the tooltip. Supports the same syntax as `ngClass`. */
  @Input('appTooltipClass')
  get tooltipClass() { return this._tooltipClass; }
  set tooltipClass(value: string|string[]|Set<string>|{[key: string]: any}) {
    this._tooltipClass = value;
    if (this._tooltipInstance) {
      this._setTooltipClass(this._tooltipClass);
    }
  }

  private _enterListener: Function;
  private _leaveListener: Function;

  constructor(
    renderer: Renderer2,
    private _overlayService: OverlayService,
    private _elementRef: ElementRef,
    private _scrollDispatcher: ScrollDispatcherService,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
    private _platform: Platform,
    private _focusMonitorService: FocusMonitorService,
    @Inject(TOOLTIP_SCROLL_STRATEGY) private _scrollStrategy) {

    // The mouse events shouldn't be bound on iOS devices, because
    // they can prevent the first tap from firing its click event.
    if (!_platform.IOS) {
      this._enterListener =
        renderer.listen(_elementRef.nativeElement, 'mouseenter', () => this.show());
      this._leaveListener =
        renderer.listen(_elementRef.nativeElement, 'mouseleave', () => this.hide());
    }

    _focusMonitorService.monitor(_elementRef.nativeElement, false).subscribe(origin => {
      // Note that the focus monitor runs outside the Angular zone.
      if (!origin) {
        _ngZone.run(() => this.hide(0));
      } else if (origin !== 'program') {
        _ngZone.run(() => this.show());
      }
    });
  }

  /**
   * Dispose the tooltip when destroyed.
   */
  ngOnDestroy() {
    if (this._tooltipInstance) {
      this._disposeTooltip();
    }

    // Clean up the event listeners set in the constructor
    if (!this._platform.IOS) {
      this._enterListener();
      this._leaveListener();
    }

    this._focusMonitorService.stopMonitoring(this._elementRef.nativeElement);
  }

  /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
  show(delay: number = this.showDelay): void {
    if (this.disabled || !this.message) { return; }

    if (!this._tooltipInstance) {
      this._createTooltip();
    }

    this._setTooltipClass(this._tooltipClass);
    this._updateTooltipMessage();
    this._tooltipInstance!.show(this._position, delay);
  }

  /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
  hide(delay: number = this.hideDelay): void {
    if (this._tooltipInstance) {
      this._tooltipInstance.hide(delay);
    }
  }

  /** Shows/hides the tooltip */
  toggle(): void {
    this._isTooltipVisible() ? this.hide() : this.show();
  }

  /** Returns true if the tooltip is currently visible to the user */
  _isTooltipVisible(): boolean {
    return !!this._tooltipInstance && this._tooltipInstance.isVisible();
  }

  /** Handles the keydown events on the host element. */
  _handleKeydown(e: KeyboardEvent) {
    if (this._isTooltipVisible() && e.keyCode === KeyCodes.ESCAPE) {
      e.stopPropagation();
      this.hide(0);
    }
  }

  /** Create the tooltip to display */
  private _createTooltip(): void {
    const overlayRef = this._createOverlay();
    const portal = new ComponentPortal(TooltipComponent, this._viewContainerRef);

    this._tooltipInstance = overlayRef.attach(portal).instance;

    // Dispose of the tooltip when the overlay is detached.
    merge(this._tooltipInstance!.afterHidden(), overlayRef.detachments()).subscribe(() => {
      // Check first if the tooltip has already been removed through this components destroy.
      if (this._tooltipInstance) {
        this._disposeTooltip();
      }
    });
  }

  /** Create the overlay config and position strategy */
  private _createOverlay(): OverlayRef {
    const origin = this._getOrigin();
    const overlay = this._getOverlayPosition();

    // Create connected position strategy that listens for scroll events to reposition.
    const strategy = this._overlayService
      .position()
      .connectedTo(this._elementRef, origin.main, overlay.main)
      .withFallbackPosition(origin.fallback, overlay.fallback);

    const scrollableAncestors = this._scrollDispatcher
      .getAncestorScrollContainers(this._elementRef);

    strategy.withScrollableContainers(scrollableAncestors);

    strategy.onPositionChange.subscribe(change => {
      if (this._tooltipInstance) {
        if (change.scrollableViewProperties.isOverlayClipped && this._tooltipInstance.isVisible()) {
          // After position changes occur and the overlay is clipped by
          // a parent scrollable then close the tooltip.
          this.hide(0);
        } else {
          // Otherwise recalculate the origin based on the new position.
          this._tooltipInstance._setTransformOrigin(change.connectionPair);
        }
      }
    });

    const config = new OverlayConfig({
      positionStrategy: strategy,
      panelClass: TOOLTIP_PANEL_CLASS,
      scrollStrategy: this._scrollStrategy()
    });

    this._overlayRef = this._overlayService.create(config);

    return this._overlayRef;
  }

  /** Disposes the current tooltip and the overlay it is attached to */
  private _disposeTooltip(): void {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }

    this._tooltipInstance = null;
  }

  /**
   * Returns the origin position and a fallback position based on the user's position preference.
   * The fallback position is the inverse of the origin (e.g. 'below' -> 'above').
   */
  _getOrigin(): {main: OriginConnectionPosition, fallback: OriginConnectionPosition} {
    let position: OriginConnectionPosition;

    if (this.position == 'above' || this.position == 'below') {
      position = {originX: 'center', originY: this.position == 'above' ? 'top' : 'bottom'};
    } else if (this.position == 'left') {
      position = {originX: 'start', originY: 'center'};
    } else if (this.position == 'right') {
      position = {originX: 'end', originY: 'center'};
    } else {
      throw getAppTooltipInvalidPositionError(this.position);
    }

    const {x, y} = this._invertPosition(position.originX, position.originY);

    return {
      main: position,
      fallback: {originX: x, originY: y}
    };
  }

  /** Returns the overlay position and a fallback position based on the user's preference */
  _getOverlayPosition(): {main: OverlayConnectionPosition, fallback: OverlayConnectionPosition} {
    let position: OverlayConnectionPosition;

    if (this.position == 'above') {
      position = {overlayX: 'center', overlayY: 'bottom'};
    } else if (this.position == 'below') {
      position = {overlayX: 'center', overlayY: 'top'};
    } else if (this.position == 'left') {
      position = {overlayX: 'end', overlayY: 'center'};
    } else if (this.position == 'right') {
      position = {overlayX: 'start', overlayY: 'center'};
    } else {
      throw getAppTooltipInvalidPositionError(this.position);
    }

    const {x, y} = this._invertPosition(position.overlayX, position.overlayY);

    return {
      main: position,
      fallback: {overlayX: x, overlayY: y}
    };
  }

  /** Updates the tooltip message and repositions the overlay according to the new message length */
  private _updateTooltipMessage() {
    // Must wait for the message to be painted to the tooltip so that the overlay can properly
    // calculate the correct positioning based on the size of the text.
    if (this._tooltipInstance) {
      this._tooltipInstance.message = this.message;
      this._tooltipInstance._markForCheck();

      this._ngZone.onMicrotaskEmpty.asObservable().pipe(first()).subscribe(() => {
        if (this._tooltipInstance) {
          this._overlayRef!.updatePosition();
        }
      });
    }
  }

  /** Updates the tooltip class */
  private _setTooltipClass(tooltipClass: string|string[]|Set<string>|{[key: string]: any}) {
    if (this._tooltipInstance) {
      this._tooltipInstance.tooltipClass = tooltipClass;
      this._tooltipInstance._markForCheck();
    }
  }

  /** Inverts an overlay position. */
  private _invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
    if (this.position === 'above' || this.position === 'below') {
      if (y === 'top') {
        y = 'bottom';
      } else if (y === 'bottom') {
        y = 'top';
      }
    } else {
      if (x === 'end') {
        x = 'start';
      } else if (x === 'start') {
        x = 'end';
      }
    }

    return {x, y};
  }
}