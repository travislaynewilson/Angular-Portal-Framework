import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ContentChildren,
	ElementRef,
	EventEmitter,
	forwardRef,
	Inject,
	Input,
	NgZone,
	OnDestroy,
	Optional,
	Output,
	QueryList,
	Renderer2,
	ViewEncapsulation
} from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { merge } from 'rxjs/observable/merge';
import { filter } from 'rxjs/operators/filter';
import { first } from 'rxjs/operators/first';
import { startWith } from 'rxjs/operators/startWith';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { map } from 'rxjs/operators/map';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import {
	CoercionHelper,
	FocusTrap,
	FocusTrapFactory,
	FocusMonitorService,
	FocusOrigin,
	KeyCodes
} from '@app/cdk';



/** Throws an exception when two DrawerComponent are matching the same position. */
export function throwDuplicatedDrawerError(position: string) {
	throw Error(`A drawer was already declared for 'position="${position}"'`);
}



/**
 * Drawer toggle promise result.
 * @deprecated
 */
export class DrawerToggleResult {
	constructor (public type: 'open' | 'close', public animationFinished: boolean) { }
}



@Component({
	selector: 'app-drawer-content',
	exportAs: 'appDrawerContent',
	template: '<ng-content></ng-content>',
	host: {
		'class': 'app-drawer-content',
		'[style.marginLeft.px]': '_margins.left',
		'[style.marginRight.px]': '_margins.right'
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class DrawerContentComponent implements AfterContentInit {

	/**
	 * Margins to be applied to the content. These are used to push / shrink the drawer content when a
	 * drawer is open. We use margin rather than transform even for push mode because transform breaks
	 * fixed position elements inside of the transformed element.
	 */
	_margins: { left: number, right: number } = { left: 0, right: 0 };

	constructor (
		private _changeDetectorRef: ChangeDetectorRef,
		@Inject(forwardRef(() => DrawerContainerComponent)) private _container: DrawerContainerComponent) {
	}

	ngAfterContentInit() {
		this._container._contentMargins.subscribe(margins => {
			this._margins = margins;
			this._changeDetectorRef.markForCheck();
		});
	}
}



/**
 * This component corresponds to a drawer that can be opened on the drawer container.
 */
@Component({
	selector: 'app-drawer',
	exportAs: 'appDrawer',
	template: '<ng-content></ng-content>',
	animations: [
		trigger('transform', [
			state('open, open-instant', style({
				transform: 'translate3d(0, 0, 0)',
				visibility: 'visible',
			})),
			state('void', style({
				visibility: 'hidden',
			})),
			transition('void => open-instant', animate('0ms')),
			transition('void <=> open, open-instant => void',
				animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
		])
	],
	host: {
		'class': 'app-drawer',
		'[@transform]': '_animationState',
		'(@transform.start)': '_onAnimationStart($event)',
		'(@transform.done)': '_onAnimationEnd($event)',
		'(keydown)': 'handleKeydown($event)',
		// must prevent the browser from aligning text based on value
		'[attr.align]': 'null',
		'[class.app-drawer-end]': 'position === "end"',
		'[class.app-drawer-over]': 'mode === "over"',
		'[class.app-drawer-push]': 'mode === "push"',
		'[class.app-drawer-side]': 'mode === "side"',
		'tabIndex': '-1'
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class DrawerComponent implements AfterContentInit, OnDestroy {

	private _focusTrap: FocusTrap;

	private _elementFocusedBeforeDrawerWasOpened: HTMLElement | null = null;

	/** Whether the drawer is initialized. Used for disabling the initial animation. */
	private _enableAnimations = false;

	/** The side that the drawer is attached to. */
	@Input()
	get position(): 'start' | 'end' { return this._position; }
	set position(value) {
		// Make sure we have a valid value.
		value = value === 'end' ? 'end' : 'start';
		if (value != this._position) {
			this._position = value;
			this.onPositionChanged.emit();
		}
	}
	private _position: 'start' | 'end' = 'start';

	/** Mode of the drawer; one of 'over', 'push' or 'side'. */
	@Input()
	get mode(): 'over' | 'push' | 'side' { return this._mode; }
	set mode(value) {
		this._mode = value;
		this._modeChanged.next();
	}
	private _mode: 'over' | 'push' | 'side' = 'over';

	/** Whether the drawer can be closed with the escape key or by clicking on the backdrop. */
	@Input()
	get disableClose(): boolean { return this._disableClose; }
	set disableClose(value: boolean) { this._disableClose = CoercionHelper.coerceBoolean(value); }
	private _disableClose: boolean = false;

	/** Whether the drawer is opened. */
	private _opened: boolean = false;

	/** How the sidenav was opened (keypress, mouse click etc.) */
	private _openedVia: FocusOrigin | null;

	/** Emits whenever the drawer has started animating. */
	_animationStarted = new EventEmitter<AnimationEvent>();

	/** Current state of the sidenav animation. */
	_animationState: 'open-instant' | 'open' | 'void' = 'void';

	/** Event emitted when the drawer open state is changed. */
	@Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	/** Event emitted when the drawer has been opened. */
	@Output('opened')
	get _openedStream(): Observable<void> {
		return this.openedChange.pipe(filter(o => o), map(() => { }));
	}

	/** Event emitted when the drawer has started opening. */
	@Output()
	get openedStart(): Observable<void> {
		return this._animationStarted.pipe(
			filter(e => e.fromState !== e.toState && e.toState.indexOf('open') === 0),
			map(() => { })
		);
	}

	/** Event emitted when the drawer has been closed. */
	@Output('closed')
	get _closedStream(): Observable<void> {
		return this.openedChange.pipe(filter(o => !o), map(() => { }));
	}

	/** Event emitted when the drawer has started closing. */
	@Output()
	get closedStart(): Observable<void> {
		return this._animationStarted.pipe(
			filter(e => e.fromState !== e.toState && e.toState === 'void'),
			map(() => { })
		);
	}

	/** Event emitted when the drawer's position changes. */
	@Output('positionChanged') onPositionChanged = new EventEmitter<void>();

	/**
	 * An observable that emits when the drawer mode changes. This is used by the drawer container to
	 * to know when to when the mode changes so it can adapt the margins on the content.
	 */
	_modeChanged = new Subject();

	get _isFocusTrapEnabled(): boolean {
		// The focus trap is only enabled when the drawer is open in any mode other than side.
		return this.opened && this.mode !== 'side';
	}

	constructor (private _elementRef: ElementRef,
		private _focusTrapFactory: FocusTrapFactory,
		private _focusMonitorService: FocusMonitorService,
		@Optional() @Inject(DOCUMENT) private _doc: any) {
		this.openedChange.subscribe((opened: boolean) => {
			if (opened) {
				if (this._doc) {
					this._elementFocusedBeforeDrawerWasOpened = this._doc.activeElement as HTMLElement;
				}

				if (this._isFocusTrapEnabled && this._focusTrap) {
					this._focusTrap.focusInitialElementWhenReady();
				}
			} else {
				this._restoreFocus();
			}
		});
	}

	/**
	 * If focus is currently inside the drawer, restores it to where it was before the drawer
	 * opened.
	 */
	private _restoreFocus() {
		const activeEl = this._doc && this._doc.activeElement;

		if (activeEl && this._elementRef.nativeElement.contains(activeEl)) {
			if (this._elementFocusedBeforeDrawerWasOpened instanceof HTMLElement) {
				this._focusMonitorService.focusVia(this._elementFocusedBeforeDrawerWasOpened, this._openedVia);
			} else {
				this._elementRef.nativeElement.blur();
			}
		}

		this._elementFocusedBeforeDrawerWasOpened = null;
		this._openedVia = null;
	}

	ngAfterContentInit() {
		this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
		this._focusTrap.enabled = this._isFocusTrapEnabled;
		this._enableAnimations = true;
	}

	ngOnDestroy() {
		if (this._focusTrap) {
			this._focusTrap.destroy();
		}
	}

	/**
	 * Whether the drawer is opened. We overload this because we trigger an event when it
	 * starts or end.
	 */
	@Input()
	get opened(): boolean { return this._opened; }
	set opened(v: boolean) {
		this.toggle(CoercionHelper.coerceBoolean(v));
	}

	/**
	 * Open the drawer.
	 * @param openedVia Whether the drawer was opened by a key press, mouse click or programmatically.
	 * Used for focus management after the sidenav is closed.
	 */
	open(openedVia?: FocusOrigin): Promise<void> {
		return this.toggle(true, openedVia);
	}

	/** Close the drawer. */
	close(): Promise<void> {
		return this.toggle(false);
	}

	/**
	 * Toggle this drawer.
	 * @param isOpen Whether the drawer should be open.
	 * @param openedVia Whether the drawer was opened by a key press, mouse click or programmatically.
	 * Used for focus management after the sidenav is closed.
	 */
	toggle(isOpen: boolean = !this.opened, openedVia: FocusOrigin = 'program'):
		Promise<void> {

		this._opened = isOpen;

		if (isOpen) {
			this._animationState = this._enableAnimations ? 'open' : 'open-instant';
			this._openedVia = openedVia;
		} else {
			this._animationState = 'void';
			this._restoreFocus();
		}

		if (this._focusTrap) {
			this._focusTrap.enabled = this._isFocusTrapEnabled;
		}

		// TODO: This promise is here for backwards-compatibility.
		// It should be removed next time we do breaking changes in the drawer.
		return new Promise<any>(resolve => {
			this.openedChange.pipe(first()).subscribe(open => {
				resolve(new DrawerToggleResult(open ? 'open' : 'close', true));
			});
		});
	}

	/**
	 * Handles the keyboard events.
	 * @docs-private
	 */
	handleKeydown(event: KeyboardEvent) {
		if (event.keyCode === KeyCodes.ESCAPE && !this.disableClose) {
			this.close();
			event.stopPropagation();
		}
	}

	_onAnimationStart(event: AnimationEvent) {
		this._animationStarted.emit(event);
	}

	_onAnimationEnd(event: AnimationEvent) {
		const { fromState, toState } = event;

		if (toState.indexOf('open') === 0 && fromState === 'void') {
			this.openedChange.emit(true);
		} else if (toState === 'void' && fromState.indexOf('open') === 0) {
			this.openedChange.emit(false);
		}
	}

	get _width() {
		return this._elementRef.nativeElement ? (this._elementRef.nativeElement.offsetWidth || 0) : 0;
	}
}



/**
 * <app-drawer-container> component.
 *
 * This is the parent component to one or two <app-drawer>s that validates the state internally
 * and coordinates the backdrop and content styling.
 */
@Component({
	selector: 'app-drawer-container',
	exportAs: 'appDrawerContainer',
	templateUrl: './drawer-container.component.html',
	styleUrls: ['./drawer.component.scss'],
	host: {
		'class': 'app-drawer-container'
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class DrawerContainerComponent implements AfterContentInit, OnDestroy {

	@ContentChildren(DrawerComponent) _drawers: QueryList<DrawerComponent>;

	@ContentChild(DrawerContentComponent) _content: DrawerContentComponent;

	/** The drawer child with the `start` position. */
	get start(): DrawerComponent | null { return this._start; }

	/** The drawer child with the `end` position. */
	get end(): DrawerComponent | null { return this._end; }

	/** Event emitted when the drawer backdrop is clicked. */
	@Output() backdropClick = new EventEmitter<void>();

	/** The drawer at the start/end position, independent of direction. */
	private _start: DrawerComponent | null;
	private _end: DrawerComponent | null;

	/**
	 * The drawer at the left/right. When direction changes, these will change as well.
	 * They're used as aliases for the above to set the left/right style properly.
	 * _left == _start and _right == _end.
	 */
	private _left: DrawerComponent | null;
	private _right: DrawerComponent | null;

	/** Emits when the component is destroyed. */
	private _destroyed = new Subject<void>();

	_contentMargins = new Subject<{ left: number, right: number }>();

	constructor (
		private _element: ElementRef,
		private _renderer: Renderer2,
		private _ngZone: NgZone,
		private _changeDetectorRef: ChangeDetectorRef) {
	}

	ngAfterContentInit() {
		this._drawers.changes.pipe(startWith(null)).subscribe(() => {
			this._validateDrawers();

			this._drawers.forEach((drawer: DrawerComponent) => {
				this._watchDrawerToggle(drawer);
				this._watchDrawerPosition(drawer);
				this._watchDrawerMode(drawer);
			});

			if (!this._drawers.length ||
				this._isDrawerOpen(this._start) ||
				this._isDrawerOpen(this._end)) {
				this._updateContentMargins();
			}

			this._changeDetectorRef.markForCheck();
		});
	}

	ngOnDestroy() {
		this._destroyed.next();
		this._destroyed.complete();
	}

	/** Calls `open` of both start and end drawers */
	open(): void {
		this._drawers.forEach(drawer => drawer.open());
	}

	/** Calls `close` of both start and end drawers */
	close(): void {
		this._drawers.forEach(drawer => drawer.close());
	}

	/**
	 * Subscribes to drawer events in order to set a class on the main container element when the
	 * drawer is open and the backdrop is visible. This ensures any overflow on the container element
	 * is properly hidden.
	 */
	private _watchDrawerToggle(drawer: DrawerComponent): void {
		drawer._animationStarted.pipe(
			takeUntil(this._drawers.changes),
			filter((event: AnimationEvent) => event.fromState !== event.toState)
		)
			.subscribe((event: AnimationEvent) => {
				// Set the transition class on the container so that the animations occur. This should not
				// be set initially because animations should only be triggered via a change in state.
				if (event.toState !== 'open-instant') {
					this._renderer.addClass(this._element.nativeElement, 'app-drawer-transition');
				}

				this._updateContentMargins();
				this._changeDetectorRef.markForCheck();
			});

		if (drawer.mode !== 'side') {
			drawer.openedChange.pipe(takeUntil(this._drawers.changes)).subscribe(() =>
				this._setContainerClass(drawer.opened));
		}
	}

	/**
	 * Subscribes to drawer onPositionChanged event in order to
	 * re-validate drawers when the position changes.
	 */
	private _watchDrawerPosition(drawer: DrawerComponent): void {
		if (!drawer) {
			return;
		}
		// NOTE: We need to wait for the microtask queue to be empty before validating,
		// since both drawers may be swapping positions at the same time.
		drawer.onPositionChanged.pipe(takeUntil(this._drawers.changes)).subscribe(() => {
			this._ngZone.onMicrotaskEmpty.asObservable().pipe(first()).subscribe(() => {
				this._validateDrawers();
			});
		});
	}

	/** Subscribes to changes in drawer mode so we can run change detection. */
	private _watchDrawerMode(drawer: DrawerComponent): void {
		if (drawer) {
			drawer._modeChanged.pipe(takeUntil(merge(this._drawers.changes, this._destroyed)))
				.subscribe(() => {
					this._updateContentMargins();
					this._changeDetectorRef.markForCheck();
				});
		}
	}

	/** Toggles the 'app-drawer-opened' class on the main 'app-drawer-container' element. */
	private _setContainerClass(isAdd: boolean): void {
		if (isAdd) {
			this._renderer.addClass(this._element.nativeElement, 'app-drawer-opened');
		} else {
			this._renderer.removeClass(this._element.nativeElement, 'app-drawer-opened');
		}
	}

	/** Validate the state of the drawer children components. */
	private _validateDrawers() {
		this._start = this._end = null;

		// Ensure that we have at most one start and one end drawer.
		this._drawers.forEach(drawer => {
			if (drawer.position == 'end') {
				if (this._end != null) {
					throwDuplicatedDrawerError('end');
				}
				this._end = drawer;
			} else {
				if (this._start != null) {
					throwDuplicatedDrawerError('start');
				}
				this._start = drawer;
			}
		});

		this._right = this._left = null;

		this._left = this._start;
		this._right = this._end;

	}

	_onBackdropClicked() {
		this.backdropClick.emit();
		this._closeModalDrawer();
	}

	_closeModalDrawer() {
		// Close all open drawers where closing is not disabled and the mode is not `side`.
		[this._start, this._end]
			.filter(drawer => drawer && !drawer.disableClose && drawer.mode !== 'side')
			.forEach(drawer => drawer!.close());
	}

	_isShowingBackdrop(): boolean {
		return (this._isDrawerOpen(this._start) && this._start!.mode != 'side')
			|| (this._isDrawerOpen(this._end) && this._end!.mode != 'side');
	}

	private _isDrawerOpen(drawer: DrawerComponent | null): boolean {
		return drawer != null && drawer.opened;
	}

	/**
	 * Recalculates and updates the inline styles for the content. Note that this should be used
	 * sparingly, because it causes a reflow.
	 */
	private _updateContentMargins() {
		// 1. For drawers in `over` mode, they don't affect the content.
		// 2. For drawers in `side` mode they should shrink the content. We do this by adding to the
		//    left margin (for left drawer) or right margin (for right the drawer).
		// 3. For drawers in `push` mode the should shift the content without resizing it. We do this by
		//    adding to the left or right margin and simultaneously subtracting the same amount of
		//    margin from the other side.

		let left = 0;
		let right = 0;

		if (this._left && this._left.opened) {
			if (this._left.mode == 'side') {
				left += this._left._width;
			} else if (this._left.mode == 'push') {
				let width = this._left._width;
				left += width;
				right -= width;
			}
		}

		if (this._right && this._right.opened) {
			if (this._right.mode == 'side') {
				right += this._right._width;
			} else if (this._right.mode == 'push') {
				let width = this._right._width;
				right += width;
				left -= width;
			}
		}

		this._contentMargins.next({ left, right });
	}
}
