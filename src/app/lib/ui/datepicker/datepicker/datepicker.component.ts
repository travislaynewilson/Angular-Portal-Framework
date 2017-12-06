import { first } from 'rxjs/operators/first';
import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ComponentRef,
	EventEmitter,
	Inject,
	InjectionToken,
	Input,
	NgZone,
	OnDestroy,
	Optional,
	Output,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { CoercionHelper } from '@app/core/util';
import { KeyCodes } from '@app/core/keycodes';
import {
	OverlayConfig,
	OverlayService,
	OverlayRef,
	PositionStrategy,
	RepositionScrollStrategy,
	ScrollStrategy,
} from '@app/core/overlay';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ComponentPortal } from '@app/core/portal';
import { DateAdapter } from '@app/lib/ui/core/datetime';
import { DialogService, DialogContext } from '@app/lib/ui/dialog';
import { CalendarComponent } from '../calendar/calendar.component';
import { DatepickerErrorFactory } from '../datepicker-error.factory';
import { DatepickerInputDirective } from '../datepicker-input.directive';
import { DatepickerContentComponent } from '../datepicker-content/datepicker-content.component';
import { DATEPICKER_SCROLL_STRATEGY } from '../datepicker-scroll.strategy';



/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;



/** Component responsible for managing the datepicker popup/dialog. */
@Component({
	selector: 'app-datepicker',
	template: '',
	exportAs: 'appDatepicker',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class DatepickerComponent<D> implements OnDestroy {
	/** The date to open the calendar to initially. */
	@Input()
	get startAt (): D | null {
		// If an explicit startAt is set we start there, otherwise we start at whatever the currently
		// selected value is.
		return this._startAt || (this._datepickerInput ? this._datepickerInput.value : null);
	}
	set startAt (date: D | null) {
		this._startAt = this._getValidDateOrNull(this._dateAdapter.deserialize(date));
	}
	private _startAt: D | null;

	/** The view that the calendar should start in. */
	@Input() startView: 'month' | 'year' = 'month';

	/**
	 * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
	 * than a popup and elements have more padding to allow for bigger touch targets.
	 */
	@Input()
	get touchUi (): boolean {
		return this._touchUi;
	}
	set touchUi (value: boolean) {
		this._touchUi = CoercionHelper.coerceBoolean(value);
	}
	private _touchUi = false;

	/** Whether the datepicker pop-up should be disabled. */
	@Input()
	get disabled (): boolean {
		return this._disabled === undefined && this._datepickerInput ?
			this._datepickerInput.disabled : !!this._disabled;
	}
	set disabled (value: boolean) {
		const newValue = CoercionHelper.coerceBoolean(value);

		if (newValue !== this._disabled) {
			this._disabled = newValue;
			this._disabledChange.next(newValue);
		}
	}
	private _disabled: boolean;

	/**
   * Emits new selected date when selected date changes.
   * @deprecated Switch to the `dateChange` and `dateInput` binding on the input element.
   */
	@Output() selectedChanged = new EventEmitter<D>();

	/** Classes to be passed to the date picker panel. Supports the same syntax as `ngClass`. */
	@Input() panelClass: string | string[];

	/** Emits when the datepicker has been opened. */
	@Output('opened') openedStream: EventEmitter<void> = new EventEmitter<void>();

	/** Emits when the datepicker has been closed. */
	@Output('closed') closedStream: EventEmitter<void> = new EventEmitter<void>();

	/** Whether the calendar is open. */
	opened = false;

	/** The id for the datepicker calendar. */
	id = `app-datepicker-${datepickerUid++}`;

	/** The currently selected date. */
	get _selected (): D | null { return this._validSelected; }
	set _selected (value: D | null) { this._validSelected = value; }
	private _validSelected: D | null = null;

	/** The minimum selectable date. */
	get _minDate (): D | null {
		return this._datepickerInput && this._datepickerInput.min;
	}

	/** The maximum selectable date. */
	get _maxDate (): D | null {
		return this._datepickerInput && this._datepickerInput.max;
	}

	get _dateFilter (): (date: D | null) => boolean {
		return this._datepickerInput && this._datepickerInput._dateFilter;
	}

	/** A reference to the overlay when the calendar is opened as a popup. */
	private _popupRef: OverlayRef;

	/** A reference to the dialog when the calendar is opened as a dialog. */
	private _dialogContext: DialogContext<any> | null;

	/** A portal containing the calendar for this datepicker. */
	private _calendarPortal: ComponentPortal<DatepickerContentComponent<D>>;

	/** The element that was focused before the datepicker was opened. */
	private _focusedElementBeforeOpen: HTMLElement | null = null;

	private _inputSubscription = Subscription.EMPTY;

	/** The input element this datepicker is associated with. */
	_datepickerInput: DatepickerInputDirective<D>;

	/** Emits when the datepicker is disabled. */
	_disabledChange = new Subject<boolean>();

	constructor (private _dialogService: DialogService,
		private _overlayService: OverlayService,
		private _ngZone: NgZone,
		private _viewContainerRef: ViewContainerRef,
		@Inject(DATEPICKER_SCROLL_STRATEGY) private _scrollStrategy,
		@Optional() private _dateAdapter: DateAdapter<D>,
		@Optional() @Inject(DOCUMENT) private _document: any) {
		if (!this._dateAdapter) {
			throw DatepickerErrorFactory.createMissingDateImplError('DateAdapter');
		}
	}

	ngOnDestroy () {
		this.close();
		this._inputSubscription.unsubscribe();
		this._disabledChange.complete();

		if (this._popupRef) {
			this._popupRef.dispose();
		}
	}

	/** Selects the given date */
	_select (date: D): void {
		let oldValue = this._selected;
		this._selected = date;
		if (!this._dateAdapter.sameDate(oldValue, this._selected)) {
			this.selectedChanged.emit(date);
		}
	}

	/**
	 * Register an input with this datepicker.
	 * @param input The datepicker input to register with this datepicker.
	 */
	_registerInput (input: DatepickerInputDirective<D>): void {
		if (this._datepickerInput) {
			throw Error('A MatDatepicker can only be associated with a single input.');
		}
		this._datepickerInput = input;
		this._inputSubscription =
			this._datepickerInput._valueChange.subscribe((value: D | null) => this._selected = value);
	}

	/** Open the calendar. */
	open (): void {
		if (this.opened || this.disabled) {
			return;
		}
		if (!this._datepickerInput) {
			throw Error('Attempted to open an MatDatepicker with no associated input.');
		}
		if (this._document) {
			this._focusedElementBeforeOpen = this._document.activeElement;
		}

		this.touchUi ? this._openAsDialog() : this._openAsPopup();
		this.opened = true;
		this.openedStream.emit();
	}

	/** Close the calendar. */
	close (): void {
		if (!this.opened) {
			return;
		}
		if (this._popupRef && this._popupRef.hasAttached()) {
			this._popupRef.detach();
		}
		if (this._dialogContext) {
			this._dialogContext.close();
			this._dialogContext = null;
		}
		if (this._calendarPortal && this._calendarPortal.isAttached) {
			this._calendarPortal.detach();
		}
		if (this._focusedElementBeforeOpen &&
			typeof this._focusedElementBeforeOpen.focus === 'function') {

			this._focusedElementBeforeOpen.focus();
			this._focusedElementBeforeOpen = null;
		}

		this.opened = false;
		this.closedStream.emit();
	}

	/** Open the calendar as a dialog. */
	private _openAsDialog (): void {
		this._dialogContext = this._dialogService.open(DatepickerContentComponent, {
			viewContainerRef: this._viewContainerRef,
			panelClass: 'mat-datepicker-dialog',
		});
		this._dialogContext.afterClosed().subscribe(() => this.close());
		this._dialogContext.componentInstance.datepicker = this;
	}

	/** Open the calendar as a popup. */
	private _openAsPopup (): void {
		if (!this._calendarPortal) {
			this._calendarPortal = new ComponentPortal(DatepickerContentComponent, this._viewContainerRef);
		}

		if (!this._popupRef) {
			this._createPopup();
		}

		if (!this._popupRef.hasAttached()) {
			let componentRef: ComponentRef<DatepickerContentComponent<D>> =
				this._popupRef.attach(this._calendarPortal);
			componentRef.instance.datepicker = this;

			// Update the position once the calendar has rendered.
			this._ngZone.onStable.asObservable().pipe(first()).subscribe(() => {
				this._popupRef.updatePosition();
			});
		}

		this._popupRef.backdropClick().subscribe(() => this.close());
	}

	/** Create the popup. */
	private _createPopup (): void {
		const overlayConfig = new OverlayConfig({
			positionStrategy: this._createPopupPositionStrategy(),
			hasBackdrop: true,
			backdropClass: 'mat-overlay-transparent-backdrop',
			scrollStrategy: this._scrollStrategy(),
			panelClass: 'mat-datepicker-popup',
		});

		this._popupRef = this._overlayService.create(overlayConfig);
	}

	/** Create the popup PositionStrategy. */
	private _createPopupPositionStrategy (): PositionStrategy {
		return this._overlayService.position()
			.connectedTo(this._datepickerInput.getPopupConnectionElementRef(),
			{ originX: 'start', originY: 'bottom' },
			{ overlayX: 'start', overlayY: 'top' }
			)
			.withFallbackPosition(
			{ originX: 'start', originY: 'top' },
			{ overlayX: 'start', overlayY: 'bottom' }
			)
			.withFallbackPosition(
			{ originX: 'end', originY: 'bottom' },
			{ overlayX: 'end', overlayY: 'top' }
			)
			.withFallbackPosition(
			{ originX: 'end', originY: 'top' },
			{ overlayX: 'end', overlayY: 'bottom' }
			);
	}

	/**
	 * @param obj The object to check.
	 * @returns The given object if it is both a date instance and valid, otherwise null.
	 */
	private _getValidDateOrNull (obj: any): D | null {
		return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
	}
}
