import {
	AfterContentInit,
	Directive,
	ElementRef,
	EventEmitter,
	forwardRef,
	Inject,
	Input,
	OnDestroy,
	Optional,
	Output,
	Renderer2
} from '@angular/core';
import {
	AbstractControl,
	ControlValueAccessor,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validator,
	ValidatorFn,
	Validators
} from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { CoercionHelper } from '@app/core/util';
import { KeyCodes } from '@app/core/keycodes';
import { DateAdapter, DATE_FORMAT, DateFormat } from '@app/lib/ui/core/datetime';
import { INPUT_VALUE_ACCESSOR } from '@app/lib/ui/core/input';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { DatepickerErrorFactory } from './datepicker-error.factory';
import { DatepickerInputEvent } from './datepicker-input.event';



export const DATEPICKER_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => DatepickerInputDirective),
	multi: true
};

export const DATEPICKER_VALIDATORS: any = {
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => DatepickerInputDirective),
	multi: true
};



/** Directive used to connect an input to a DatepickerComponent. */
@Directive({
	selector: 'input[appDatepicker]',
	providers: [
		DATEPICKER_VALUE_ACCESSOR,
		DATEPICKER_VALIDATORS,
		{ provide: INPUT_VALUE_ACCESSOR, useExisting: DatepickerInputDirective }
	],
	host: {
		'[attr.aria-haspopup]': 'true',
		'[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
		'[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
		'[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
		'[disabled]': 'disabled',
		'(input)': '_onInput($event.target.value)',
		'(change)': '_onChange()',
		'(blur)': '_onTouched()',
		'(keydown)': '_onKeydown($event)'
	},
	exportAs: 'appDatepickerInput'
})
export class DatepickerInputDirective<D> implements AfterContentInit, ControlValueAccessor, OnDestroy,Validator {

	/** The datepicker that this input is associated with. */
	@Input()
	set appDatepicker (value: DatepickerComponent<D>) {
		this.registerDatepicker(value);
	}
	_datepicker: DatepickerComponent<D>;

	private registerDatepicker (value: DatepickerComponent<D>) {
		if (value) {
			this._datepicker = value;
			this._datepicker._registerInput(this);
		}
	}

	@Input() set appDatepickerFilter (filter: (date: D | null) => boolean) {
		this._dateFilter = filter;
		this._validatorOnChange();
	}
	_dateFilter: (date: D | null) => boolean;

	/** The value of the input. */
	@Input()
	get value (): D | null {
		return this._value;
	}
	set value (value: D | null) {
		value = this._dateAdapter.deserialize(value);
		this._lastValueValid = !value || this._dateAdapter.isValid(value);
		value = this._getValidDateOrNull(value);
		let oldDate = this.value;
		this._value = value;
		this._renderer.setProperty(this._elementRef.nativeElement, 'value',
			value ? this._dateAdapter.format(value, this._dateFormat.display.dateInput) : '');
		if (!this._dateAdapter.sameDate(oldDate, value)) {
			this._valueChange.emit(value);
		}
	}
	private _value: D | null;

	/** The minimum valid date. */
	@Input()
	get min (): D | null { return this._min; }
	set min (value: D | null) {
		this._min = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
		this._validatorOnChange();
	}
	private _min: D | null;

	/** The maximum valid date. */
	@Input()
	get max (): D | null { return this._max; }
	set max (value: D | null) {
		this._max = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
		this._validatorOnChange();
	}
	private _max: D | null;

	/** Whether the datepicker-input is disabled. */
	@Input()
	get disabled () { return !!this._disabled; }
	set disabled (value: any) {
		const newValue = CoercionHelper.coerceBoolean(value);

		if (this._disabled !== newValue) {
			this._disabled = newValue;
			this._disabledChange.emit(newValue);
		}
	}
	private _disabled: boolean;

	/** Emits when a `change` event is fired on this `<input>`. */
	@Output() dateChange = new EventEmitter<DatepickerInputEvent<D>>();

	/** Emits when an `input` event is fired on this `<input>`. */
	@Output() dateInput = new EventEmitter<DatepickerInputEvent<D>>();

	/** Emits when the value changes (either due to user input or programmatic change). */
	_valueChange = new EventEmitter<D | null>();

	/** Emits when the disabled state has changed */
	_disabledChange = new EventEmitter<boolean>();

	_onTouched = () => { };

	private _cvaOnChange: (value: any) => void = () => { };

	private _validatorOnChange = () => { };

	private _datepickerSubscription = Subscription.EMPTY;

	private _localeSubscription = Subscription.EMPTY;

	/** The form control validator for whether the input parses. */
	private _parseValidator: ValidatorFn = (): ValidationErrors | null => {
		return this._lastValueValid ?
			null : { 'appDatepickerParse': { 'text': this._elementRef.nativeElement.value } };
	}

	/** The form control validator for the min date. */
	private _minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
		const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
		return (!this.min || !controlValue ||
			this._dateAdapter.compareDate(this.min, controlValue) <= 0) ?
			null : { 'appDatepickerMin': { 'min': this.min, 'actual': controlValue } };
	}

	/** The form control validator for the max date. */
	private _maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
		const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
		return (!this.max || !controlValue ||
			this._dateAdapter.compareDate(this.max, controlValue) >= 0) ?
			null : { 'appDatepickerMax': { 'max': this.max, 'actual': controlValue } };
	}

	/** The form control validator for the date filter. */
	private _filterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
		const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
		return !this._dateFilter || !controlValue || this._dateFilter(controlValue) ?
			null : { 'appDatepickerFilter': true };
	}

	/** The combined form control validator for this input. */
	private _validator: ValidatorFn | null =
		Validators.compose(
			[this._parseValidator, this._minValidator, this._maxValidator, this._filterValidator]);

	/** Whether the last value set on the input was valid. */
	private _lastValueValid = false;

	constructor (
		private _elementRef: ElementRef,
		private _renderer: Renderer2,
		@Optional() private _dateAdapter: DateAdapter<D>,
		@Optional() @Inject(DATE_FORMAT) private _dateFormat: DateFormat) {
		if (!this._dateAdapter) {
			throw DatepickerErrorFactory.createMissingDateImplError('DateAdapter');
		}
		if (!this._dateFormat) {
			throw DatepickerErrorFactory.createMissingDateImplError('DATE_FORMAT');
		}

		// Update the displayed date when the locale changes.
		this._localeSubscription = _dateAdapter.localeChanges.subscribe(() => {
			this.value = this.value;
		});
	}

	ngAfterContentInit () {
		if (this._datepicker) {
			this._datepickerSubscription =
				this._datepicker.selectedChanged.subscribe((selected: D) => {
					this.value = selected;
					this._cvaOnChange(selected);
					this._onTouched();
					this.dateInput.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
					this.dateChange.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
				});
		}
	}

	ngOnDestroy () {
		this._datepickerSubscription.unsubscribe();
		this._localeSubscription.unsubscribe();
		this._valueChange.complete();
		this._disabledChange.complete();
	}

	registerOnValidatorChange (fn: () => void): void {
		this._validatorOnChange = fn;
	}

	validate (c: AbstractControl): ValidationErrors | null {
		return this._validator ? this._validator(c) : null;
	}

	/**
	 * Gets the element that the datepicker popup should be connected to.
	 * @return The element to connect the popup to.
	 */
	getPopupConnectionElementRef (): ElementRef {
		return this._elementRef;
	}

	// Implemented as part of ControlValueAccessor
	writeValue (value: D): void {
		this.value = value;
	}

	// Implemented as part of ControlValueAccessor
	registerOnChange (fn: (value: any) => void): void {
		this._cvaOnChange = fn;
	}

	// Implemented as part of ControlValueAccessor
	registerOnTouched (fn: () => void): void {
		this._onTouched = fn;
	}

	// Implemented as part of ControlValueAccessor
	setDisabledState (disabled: boolean): void {
		this.disabled = disabled;
	}

	_onKeydown (event: KeyboardEvent) {
		if (event.altKey && event.keyCode === KeyCodes.DOWN_ARROW) {
			this._datepicker.open();
			event.preventDefault();
		}
	}

	_onInput (value: string) {
		let date = this._dateAdapter.parse(value, this._dateFormat.parse.dateInput);
		this._lastValueValid = !date || this._dateAdapter.isValid(date);
		date = this._getValidDateOrNull(date);
		this._value = date;
		this._cvaOnChange(date);
		this._valueChange.emit(date);
		this.dateInput.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
	}

	_onChange () {
		this.dateChange.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
	}

	/**
	 * @param obj The object to check.
	 * @returns The given object if it is both a date instance and valid, otherwise null.
	 */
	private _getValidDateOrNull (obj: any): D | null {
		return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
	}
}
