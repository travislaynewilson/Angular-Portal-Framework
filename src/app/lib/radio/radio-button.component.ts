import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChildren,
	Directive,
	ElementRef,
	EventEmitter,
	forwardRef,
	Input,
	OnDestroy,
	OnInit,
	Optional,
	Output,
	QueryList,
	Renderer2,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
	CanDisable,
	CoercionHelper,
	DisabledMixin,
	FocusMonitorService,
	FocusOrigin,
	UniqueSelectionDispatcherService
} from '@app/cdk';
import { RadioChangeEvent } from './radio-change.event';



// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;



/**
 * Provider Expression that allows mat-radio-group to register as a ControlValueAccessor. This
 * allows it to support [(ngModel)] and ngControl.
 */
export const RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => RadioGroupDirective),
	multi: true
};



// Boilerplate for applying mixins to RadioGroupDirective.
export class RadioGroupDirectiveCore { }



export const BaseRadioGroupDirective = DisabledMixin(RadioGroupDirectiveCore);



/**
 * A group of radio buttons. May contain one or more `<app-radio-button>` elements.
 */
@Directive({
	selector: 'app-radio-group',
	exportAs: 'appRadioGroup',
	providers: [RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
	host: {
		'role': 'radiogroup',
		'class': 'app-radio-group',
		'[class.app-radio-group-stacked]': 'stacked'
	},
	inputs: ['disabled']
})
export class RadioGroupDirective extends BaseRadioGroupDirective implements AfterContentInit, ControlValueAccessor, CanDisable {

	/**
	 * Selected value for group. Should equal the value of the selected radio button if there *is*
	 * a corresponding radio button with a matching value. If there is *not* such a corresponding
	 * radio button, this value persists to be applied in case a new radio button is added with a
	 * matching value.
	 */
	private _value: any = null;

	/** The HTML name attribute applied to radio buttons in this group. */
	private _name: string = `app-radio-group-${nextUniqueId++}`;

	/** The currently selected radio button. Should match value. */
	private _selected: RadioButtonComponent | null = null;

	/** Whether the `value` has been set to its initial value. */
	private _isInitialized: boolean = false;

	/** Whether the labels should appear after or before the radio-buttons. Defaults to 'after' */
	private _labelPosition: 'before' | 'after' = 'after';

	/** Whether the radio group is disabled. */
	private _disabled: boolean = false;

	/** Whether the radio group is required. */
	private _required: boolean = false;

	/** Whether the radio group is stacked or inline. */
	private _stacked: boolean = false;

	/** The method to be called in order to update ngModel */
	_controlValueAccessorChangeFn: (value: any) => void = () => { };

	/** onTouch function registered via registerOnTouch (ControlValueAccessor). */
	onTouched: () => any = () => { };

	/**
	 * Event emitted when the group value changes.
	 * Change events are only emitted when the value changes due to user interaction with
	 * a radio button (the same behavior as `<input type-"radio">`).
	 */
	@Output() change: EventEmitter<RadioChangeEvent> = new EventEmitter<RadioChangeEvent>();

	/** Child radio buttons. */
	@ContentChildren(forwardRef(() => RadioButtonComponent), { descendants: true })
	_radios: QueryList<RadioButtonComponent>;

	/** Name of the radio button group. All radio buttons inside this group will use this name. */
	@Input()
	get name(): string { return this._name; }
	set name(value: string) {
		this._name = value;
		this._updateRadioButtonNames();
	}

	/** Whether the labels should appear after or before the radio-buttons. Defaults to 'after' */
	@Input()
	get labelPosition(): 'before' | 'after' {
		return this._labelPosition;
	}

	set labelPosition(v) {
		this._labelPosition = (v == 'before') ? 'before' : 'after';
		this._markRadiosForCheck();
	}

	/** Value of the radio button. */
	@Input()
	get value(): any { return this._value; }
	set value(newValue: any) {
		if (this._value != newValue) {
			// Set this before proceeding to ensure no circular loop occurs with selection.
			this._value = newValue;

			this._updateSelectedRadioFromValue();
			this._checkSelectedRadioButton();
		}
	}

	_checkSelectedRadioButton() {
		if (this._selected && !this._selected.checked) {
			this._selected.checked = true;
		}
	}

	/** Whether the radio button is selected. */
	@Input()
	get selected() { return this._selected; }
	set selected(selected: RadioButtonComponent | null) {
		this._selected = selected;
		this.value = selected ? selected.value : null;
		this._checkSelectedRadioButton();
	}

	/** Whether the radio group is disabled */
	@Input()
	get disabled(): boolean { return this._disabled; }
	set disabled(value) {
		this._disabled = CoercionHelper.coerceBoolean(value);
		this._markRadiosForCheck();
	}

	/** Whether the radio group is stacked or inline */
	@Input()
	get stacked(): boolean { return this._stacked; }
	set stacked(value) {
		this._stacked = CoercionHelper.coerceBoolean(value);
		this._markRadiosForCheck();
	}

	/** Whether the radio group is required */
	@Input()
	get required(): boolean { return this._required; }
	set required(value: boolean) {
		this._required = CoercionHelper.coerceBoolean(value);
		this._markRadiosForCheck();
	}

	constructor (private _changeDetector: ChangeDetectorRef) {
		super();
	}

	/**
	 * Initialize properties once content children are available.
	 * This allows us to propagate relevant attributes to associated buttons.
	 */
	ngAfterContentInit() {
		// Mark this component as initialized in AfterContentInit because the initial value can
		// possibly be set by NgModel on RadioGroupDirective, and it is possible that the OnInit of the
		// NgModel occurs *after* the OnInit of the RadioGroupDirective.
		this._isInitialized = true;
	}

	/**
	 * Mark this group as being "touched" (for ngModel). Meant to be called by the contained
	 * radio buttons upon their blur.
	 */
	_touch() {
		if (this.onTouched) {
			this.onTouched();
		}
	}

	private _updateRadioButtonNames(): void {
		if (this._radios) {
			this._radios.forEach(radio => {
				radio.name = this.name;
			});
		}
	}

	/** Updates the `selected` radio button from the internal _value state. */
	private _updateSelectedRadioFromValue(): void {

		// If the value already matches the selected radio, do nothing.
		const isAlreadySelected = this._selected != null && this._selected.value == this._value;

		if (this._radios != null && !isAlreadySelected) {
			this._selected = null;
			this._radios.forEach(radio => {
				radio.checked = this.value == radio.value;
				if (radio.checked) {
					this._selected = radio;
				}
			});
		}
	}

	/** Dispatch change event with current selection and group value. */
	_emitChangeEvent(): void {
		if (this._isInitialized) {
			const event = new RadioChangeEvent();
			event.source = this._selected;
			event.value = this._value;
			this.change.emit(event);
		}
	}

	_markRadiosForCheck() {
		if (this._radios) {
			this._radios.forEach(radio => radio._markForCheck());
		}
	}

	/**
	 * Sets the model value. Implemented as part of ControlValueAccessor.
	 * @param value
	 */
	writeValue(value: any) {
		this.value = value;
		this._changeDetector.markForCheck();
	}

	/**
	 * Registers a callback to be triggered when the model value changes.
	 * Implemented as part of ControlValueAccessor.
	 * @param fn Callback to be registered.
	 */
	registerOnChange(fn: (value: any) => void) {
		this._controlValueAccessorChangeFn = fn;
	}

	/**
	 * Registers a callback to be triggered when the control is touched.
	 * Implemented as part of ControlValueAccessor.
	 * @param fn Callback to be registered.
	 */
	registerOnTouched(fn: any) {
		this.onTouched = fn;
	}

	/**
	 * Sets the disabled state of the control. Implemented as a part of ControlValueAccessor.
	 * @param isDisabled Whether the control should be disabled.
	 */
	setDisabledState(isDisabled: boolean) {
		this.disabled = isDisabled;
		this._changeDetector.markForCheck();
	}
}



/**
 * A radio-button. May be inside of <app-radio-group>
 */
@Component({
	selector: 'app-radio-button',
	exportAs: 'appRadioButton',
	templateUrl: 'radio-button.component.html',
	styleUrls: ['radio-button.component.scss'],
	host: {
		'class': 'app-radio-button',
		'[class.app-radio-checked]': 'checked',
		'[class.app-radio-disabled]': 'disabled',
		'[attr.id]': 'id',
		// Note: under normal conditions focus shouldn't land on this element, however it may be
		// programmatically set, for example inside of a focus trap, in this case we want to forward
		// the focus to the native element.
		'(focus)': '_inputElement.nativeElement.focus()'
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class RadioButtonComponent implements OnInit, AfterViewInit, OnDestroy {

	private _uniqueId: string = `app-radio-${++nextUniqueId}`;

	/** The unique ID for the radio button. */
	@Input() id: string = this._uniqueId;

	/** Analog to HTML 'name' attribute used to group radios for unique selection. */
	@Input() name: string;

	/** Used to set the 'aria-label' attribute on the underlying input element. */
	@Input('aria-label') ariaLabel: string;

	/** The 'aria-labelledby' attribute takes precedence as the element's text alternative. */
	@Input('aria-labelledby') ariaLabelledby: string;

	/** Whether this radio button is checked. */
	@Input()
	get checked(): boolean {
		return this._checked;
	}
	set checked(newCheckedState: boolean) {
		if (this._checked != newCheckedState) {
			this._checked = newCheckedState;

			if (newCheckedState && this.radioGroup && this.radioGroup.value != this.value) {
				this.radioGroup.selected = this;
			} else if (!newCheckedState && this.radioGroup && this.radioGroup.value == this.value) {
				// When unchecking the selected radio button, update the selected radio
				// property on the group.
				this.radioGroup.selected = null;
			}

			if (newCheckedState) {
				// Notify all radio buttons with the same name to un-check.
				this._radioDispatcherService.notify(this.id, this.name);
			}
			this._changeDetector.markForCheck();
		}
	}

	/** The value of this radio button. */
	@Input()
	get value(): any {
		return this._value;
	}

	set value(value: any) {
		if (this._value != value) {
			this._value = value;
			if (this.radioGroup != null) {
				if (!this.checked) {
					// Update checked when the value changed to match the radio group's value
					this.checked = this.radioGroup.value == value;
				}
				if (this.checked) {
					this.radioGroup.selected = this;
				}
			}
		}
	}

	private _labelPosition: 'before' | 'after';

	/** Whether the label should appear after or before the radio button. Defaults to 'after' */
	@Input()
	get labelPosition(): 'before' | 'after' {
		return this._labelPosition || (this.radioGroup && this.radioGroup.labelPosition) || 'after';
	}

	set labelPosition(value) {
		this._labelPosition = value;
	}

	/** Whether the radio button is disabled. */
	@Input()
	get disabled(): boolean {
		return this._disabled || (this.radioGroup != null && this.radioGroup.disabled);
	}
	set disabled(value: boolean) {
		this._disabled = CoercionHelper.coerceBoolean(value);
	}

	/** Whether the radio button is required. */
	@Input()
	get required(): boolean {
		return this._required || (this.radioGroup && this.radioGroup.required);
	}
	set required(value: boolean) {
		this._required = CoercionHelper.coerceBoolean(value);
	}

	/**
	 * Event emitted when the checked state of this radio button changes.
	 * Change events are only emitted when the value changes due to user interaction with
	 * the radio button (the same behavior as `<input type-"radio">`).
	 */
	@Output() change: EventEmitter<RadioChangeEvent> = new EventEmitter<RadioChangeEvent>();

	/** The parent radio group. May or may not be present. */
	radioGroup: RadioGroupDirective;

	/** ID of the native input element inside `<mat-radio-button>` */
	get inputId(): string { return `${this.id || this._uniqueId}-input`; }

	/** Whether this radio is checked. */
	private _checked: boolean = false;

	/** Whether this radio is disabled. */
	private _disabled: boolean;

	/** Whether this radio is required. */
	private _required: boolean;

	/** Value assigned to this radio.*/
	private _value: any = null;

	/** Unregister function for _radioDispatcher **/
	private _removeUniqueSelectionListener: () => void = () => { };

	/** The native `<input type=radio>` element */
	@ViewChild('input') _inputElement: ElementRef;

	constructor ( @Optional() radioGroup: RadioGroupDirective,
		private _elementRef: ElementRef,
		private _renderer: Renderer2,
		private _changeDetector: ChangeDetectorRef,
		private _focusMonitorService: FocusMonitorService,
		private _radioDispatcherService: UniqueSelectionDispatcherService) {

		// Assertions. Ideally these should be stripped out by the compiler.
		this.radioGroup = radioGroup;

		this._removeUniqueSelectionListener =
			_radioDispatcherService.listen((id: string, name: string) => {
				if (id != this.id && name == this.name) {
					this.checked = false;
				}
			});
	}

	/** Focuses the radio button. */
	focus(): void {
		this._focusMonitorService.focusVia(this._inputElement.nativeElement, 'keyboard');
	}

	/**
	 * Marks the radio button as needing checking for change detection.
	 * This method is exposed because the parent radio group will directly
	 * update bound properties of the radio button.
	 */
	_markForCheck() {
		// When group value changes, the button will not be notified. Use `markForCheck` to explicit
		// update radio button's status
		this._changeDetector.markForCheck();
	}

	ngOnInit() {
		if (this.radioGroup) {
			// If the radio is inside a radio group, determine if it should be checked
			this.checked = this.radioGroup.value === this._value;

			// Copy name from parent radio group
			this.name = this.radioGroup.name;
		}
	}

	ngAfterViewInit() {
		this._focusMonitorService.monitor(this._inputElement.nativeElement, false)
			.subscribe(focusOrigin => this._onInputFocusChange(focusOrigin));
	}

	ngOnDestroy() {
		this._focusMonitorService.stopMonitoring(this._inputElement.nativeElement);
		this._removeUniqueSelectionListener();
	}

	/** Dispatch change event with current value. */
	private _emitChangeEvent(): void {
		const event = new RadioChangeEvent();
		event.source = this;
		event.value = this._value;
		this.change.emit(event);
	}

	_onInputClick(event: Event) {
		// We have to stop propagation for click events on the visual hidden input element.
		// By default, when a user clicks on a label element, a generated click event will be
		// dispatched on the associated input element. Since we are using a label element as our
		// root container, the click event on the `radio-button` will be executed twice.
		// The real click event will bubble up, and the generated click event also tries to bubble up.
		// This will lead to multiple click events.
		// Preventing bubbling for the second event will solve that issue.
		event.stopPropagation();
	}

	/**
	 * Triggered when the radio button received a click or the input recognized any change.
	 * Clicking on a label element, will trigger a change event on the associated input.
	 */
	_onInputChange(event: Event) {
		// We always have to stop propagation on the change event.
		// Otherwise the change event, from the input element, will bubble up and
		// emit its event object to the `change` output.
		event.stopPropagation();

		const groupValueChanged = this.radioGroup && this.value != this.radioGroup.value;
		this.checked = true;
		this._emitChangeEvent();

		if (this.radioGroup) {
			this.radioGroup._controlValueAccessorChangeFn(this.value);
			this.radioGroup._touch();
			if (groupValueChanged) {
				this.radioGroup._emitChangeEvent();
			}
		}
	}

	/** Function is called whenever the focus changes for the input element. */
	private _onInputFocusChange(focusOrigin: FocusOrigin) {
		if (!focusOrigin) {
			if (this.radioGroup) {
				this.radioGroup._touch();
			}
		}
	}
}
