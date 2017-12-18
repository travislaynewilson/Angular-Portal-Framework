import {
	AfterContentInit,
	Directive,
	ElementRef,
	EventEmitter,
	Inject,
	InjectionToken,
	Input,
	OnDestroy,
	Optional,
	Output,
	Self,
	ViewContainerRef,
} from '@angular/core';
import { filter } from 'rxjs/operators/filter';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { Subscription } from 'rxjs/Subscription';
import {
	ConnectedPositionStrategy,
	HorizontalConnectionPos,
	KeyCodes,
	isFakeMousedownFromScreenReader,
	OverlayService,
	OverlayRef,
	OverlayConfig,
	RepositionScrollStrategy,
	ScrollStrategy,
	TemplatePortal,
	VerticalConnectionPos,
} from '@app/cdk';
import { MENU_SCROLL_STRATEGY } from './menu-scroll.strategy';
import { MenuComponent } from './menu.component';
import { MenuItemComponent } from './menu-item.component';
import { throwMatMenuMissingError } from './menu-errors';
import { MenuPanel } from './menu-panel';
import { MenuPositionX, MenuPositionY } from './menu-positions';



/** Default top padding of the menu panel. */
export const MENU_PANEL_TOP_PADDING = 8;



/**
 * This directive is intended to be used in conjunction with an app-menu tag.  It is
 * responsible for toggling the display of the provided menu instance.
 */
@Directive({
	selector: `[appMenuTriggerFor]`,
	host: {
		'aria-haspopup': 'true',
		'(mousedown)': '_handleMousedown($event)',
		'(keydown)': '_handleKeydown($event)',
		'(click)': '_handleClick($event)'
	},
	exportAs: 'appMenuTriggerFor'
})
export class MenuTriggerDirective implements AfterContentInit, OnDestroy {
	private _portal: TemplatePortal<any>;
	private _overlayRef: OverlayRef | null = null;
	private _menuOpen: boolean = false;
	private _closeSubscription = Subscription.EMPTY;
	private _positionSubscription = Subscription.EMPTY;
	private _hoverSubscription = Subscription.EMPTY;

	// Tracking input type is necessary so it's possible to only auto-focus
	// the first item of the list when the menu is opened via the keyboard
	private _openedByMouse: boolean = false;

	/** References the menu instance that the trigger is associated with. */
	@Input('appMenuTriggerFor') menu: MenuPanel;

	/** Event emitted when the associated menu is opened. */
	@Output() menuOpened = new EventEmitter<void>();

	/**
	 * Event emitted when the associated menu is opened.
	 * @deprecated Switch to `menuOpened` instead
	 */
	@Output() onMenuOpen = this.menuOpened;

	/** Event emitted when the associated menu is closed. */
	@Output() menuClosed = new EventEmitter<void>();

	/**
	 * Event emitted when the associated menu is closed.
	 * @deprecated Switch to `menuClosed` instead
	 */
	@Output() onMenuClose = this.menuClosed;

	constructor (private _overlayService: OverlayService,
		private _element: ElementRef,
		private _viewContainerRef: ViewContainerRef,
		@Inject(MENU_SCROLL_STRATEGY) private _scrollStrategy,
		@Optional() private _parentMenu: MenuComponent,
		@Optional() @Self() private _menuItemInstance: MenuItemComponent) {

		if (_menuItemInstance) {
			_menuItemInstance._triggersSubmenu = this.triggersSubmenu();
		}
	}

	ngAfterContentInit() {
		this._checkMenu();

		this.menu.close.subscribe(reason => {
			this._destroyMenu();

			// If a click closed the menu, we should close the entire chain of nested menus.
			if (reason === 'click' && this._parentMenu) {
				this._parentMenu.closed.emit(reason);
			}
		});

		if (this.triggersSubmenu()) {
			// Subscribe to changes in the hovered item in order to toggle the panel.
			this._hoverSubscription = this._parentMenu._hovered()
				.pipe(filter(active => active === this._menuItemInstance))
				.subscribe(() => {
					this._openedByMouse = true;
					this.openMenu();
				});
		}
	}

	ngOnDestroy() {
		if (this._overlayRef) {
			this._overlayRef.dispose();
			this._overlayRef = null;
		}

		this._cleanUpSubscriptions();
	}

	/** Whether the menu is open. */
	get menuOpen(): boolean {
		return this._menuOpen;
	}

	/** Whether the menu triggers a sub-menu or a top-level one. */
	triggersSubmenu(): boolean {
		return !!(this._menuItemInstance && this._parentMenu);
	}

	/** Toggles the menu between the open and closed states. */
	toggleMenu(): void {
		return this._menuOpen ? this.closeMenu() : this.openMenu();
	}

	/** Opens the menu. */
	openMenu(): void {
		if (!this._menuOpen) {
			this._createOverlay().attach(this._portal);
			this._closeSubscription = this._menuClosingActions().subscribe(() => {
				this.menu.close.emit();
			});
			this._initMenu();

			if (this.menu instanceof MenuComponent) {
				this.menu._startAnimation();
			}
		}
	}

	/** Closes the menu. */
	closeMenu(): void {
		this.menu.close.emit();
	}

	/** Focuses the menu trigger. */
	focus() {
		this._element.nativeElement.focus();
	}

	/** Closes the menu and does the necessary cleanup. */
	private _destroyMenu() {
		if (this._overlayRef && this.menuOpen) {
			this._resetMenu();
			this._overlayRef.detach();
			this._closeSubscription.unsubscribe();

			if (this.menu instanceof MenuComponent) {
				this.menu._resetAnimation();
			}
		}
	}

	/**
	 * This method sets the menu state to open and focuses the first item if
	 * the menu was opened via the keyboard.
	 */
	private _initMenu(): void {
		this.menu.parentMenu = this.triggersSubmenu() ? this._parentMenu : undefined;
		this._setMenuElevation();
		this._setIsMenuOpen(true);

		// If the menu was opened by mouse, we focus the root node, which allows for the keyboard
		// interactions to work. Otherwise, if the menu was opened by keyboard, we focus the first item.
		if (this._openedByMouse) {
			let rootNode = this._overlayRef!.overlayElement.firstElementChild as HTMLElement;

			if (rootNode) {
				this.menu.resetActiveItem();
				rootNode.focus();
			}
		} else {
			this.menu.focusFirstItem();
		}
	}

	/** Updates the menu elevation based on the amount of parent menus that it has. */
	private _setMenuElevation(): void {
		if (this.menu.setElevation) {
			let depth = 0;
			let parentMenu = this.menu.parentMenu;

			while (parentMenu) {
				depth++;
				parentMenu = parentMenu.parentMenu;
			}

			this.menu.setElevation(depth);
		}
	}

	/**
	 * This method resets the menu when it's closed, most importantly restoring
	 * focus to the menu trigger if the menu was opened via the keyboard.
	 */
	private _resetMenu(): void {
		this._setIsMenuOpen(false);

		// Focus only needs to be reset to the host element if the menu was opened
		// by the keyboard and manually shifted to the first menu item.
		if (!this._openedByMouse) {
			this.focus();
		}

		this._openedByMouse = false;
	}

	// set state rather than toggle to support triggers sharing a menu
	private _setIsMenuOpen(isOpen: boolean): void {
		this._menuOpen = isOpen;
		this._menuOpen ? this.menuOpened.emit() : this.menuClosed.emit();

		if (this.triggersSubmenu()) {
			this._menuItemInstance._highlighted = isOpen;
		}
	}

	/**
	 * This method checks that a valid instance of MatMenu has been passed into
	 * matMenuTriggerFor. If not, an exception is thrown.
	 */
	private _checkMenu() {
		if (!this.menu) {
			throwMatMenuMissingError();
		}
	}

	/**
	 * This method creates the overlay from the provided menu's template and saves its
	 * OverlayRef so that it can be attached to the DOM when openMenu is called.
	 */
	private _createOverlay(): OverlayRef {
		if (!this._overlayRef) {
			this._portal = new TemplatePortal(this.menu.templateRef, this._viewContainerRef);
			const config = this._getOverlayConfig();
			this._subscribeToPositions(config.positionStrategy as ConnectedPositionStrategy);
			this._overlayRef = this._overlayService.create(config);
		}

		return this._overlayRef;
	}

	/**
	 * This method builds the configuration object needed to create the overlay, the OverlayState.
	 * @returns OverlayConfig
	 */
	private _getOverlayConfig(): OverlayConfig {
		return new OverlayConfig({
			positionStrategy: this._getPosition(),
			hasBackdrop: !this.triggersSubmenu(),
			backdropClass: 'cdk-overlay-transparent-backdrop',
			scrollStrategy: this._scrollStrategy()
		});
	}

	/**
	 * Listens to changes in the position of the overlay and sets the correct classes
	 * on the menu based on the new position. This ensures the animation origin is always
	 * correct, even if a fallback position is used for the overlay.
	 */
	private _subscribeToPositions(position: ConnectedPositionStrategy): void {
		this._positionSubscription = position.onPositionChange.subscribe(change => {
			const posX: MenuPositionX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
			const posY: MenuPositionY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';

			this.menu.setPositionClasses(posX, posY);
		});
	}

	/**
	 * This method builds the position strategy for the overlay, so the menu is properly connected
	 * to the trigger.
	 * @returns ConnectedPositionStrategy
	 */
	private _getPosition(): ConnectedPositionStrategy {
		let [originX, originFallbackX]: HorizontalConnectionPos[] =
			this.menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];

		let [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
			this.menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

		let [originY, originFallbackY] = [overlayY, overlayFallbackY];
		let [overlayX, overlayFallbackX] = [originX, originFallbackX];
		let offsetY = 0;

		if (this.triggersSubmenu()) {
			// When the menu is a sub-menu, it should always align itself
			// to the edges of the trigger, instead of overlapping it.
			overlayFallbackX = originX = this.menu.xPosition === 'before' ? 'start' : 'end';
			originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
			offsetY = overlayY === 'bottom' ? MENU_PANEL_TOP_PADDING : -MENU_PANEL_TOP_PADDING;
		} else if (!this.menu.overlapTrigger) {
			originY = overlayY === 'top' ? 'bottom' : 'top';
			originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
		}

		return this._overlayService.position()
			.connectedTo(this._element, { originX, originY }, { overlayX, overlayY })
			.withOffsetY(offsetY)
			.withFallbackPosition(
			{ originX: originFallbackX, originY },
			{ overlayX: overlayFallbackX, overlayY })
			.withFallbackPosition(
			{ originX, originY: originFallbackY },
			{ overlayX, overlayY: overlayFallbackY },
			undefined, -offsetY)
			.withFallbackPosition(
			{ originX: originFallbackX, originY: originFallbackY },
			{ overlayX: overlayFallbackX, overlayY: overlayFallbackY },
			undefined, -offsetY);
	}

	/** Cleans up the active subscriptions. */
	private _cleanUpSubscriptions(): void {
		this._closeSubscription.unsubscribe();
		this._positionSubscription.unsubscribe();
		this._hoverSubscription.unsubscribe();
	}

	/** Returns a stream that emits whenever an action that should close the menu occurs. */
	private _menuClosingActions() {
		const backdrop = this._overlayRef!.backdropClick();
		const parentClose = this._parentMenu ? this._parentMenu.close : observableOf();
		const hover = this._parentMenu ? this._parentMenu._hovered().pipe(
			filter(active => active !== this._menuItemInstance),
			filter(() => this._menuOpen)
		) : observableOf();

		return merge(backdrop, parentClose, hover);
	}

	/** Handles mouse presses on the trigger. */
	_handleMousedown(event: MouseEvent): void {
		if (!isFakeMousedownFromScreenReader(event)) {
			this._openedByMouse = true;

			// Since clicking on the trigger won't close the menu if it opens a sub-menu,
			// we should prevent focus from moving onto it via click to avoid the
			// highlight from lingering on the menu item.
			if (this.triggersSubmenu()) {
				event.preventDefault();
			}
		}
	}

	/** Handles key presses on the trigger. */
	_handleKeydown(event: KeyboardEvent): void {
		const keyCode = event.keyCode;

		if (this.triggersSubmenu() && keyCode === KeyCodes.RIGHT_ARROW) {
			this.openMenu();
		}
	}

	/** Handles click events on the trigger. */
	_handleClick(event: MouseEvent): void {
		if (this.triggersSubmenu()) {
			// Stop event propagation to avoid closing the parent menu.
			event.stopPropagation();
			this.openMenu();
		} else {
			this.toggleMenu();
		}
	}

}
