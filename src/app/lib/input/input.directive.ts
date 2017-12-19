import {
	Directive,
	DoCheck,
	ElementRef,
	Inject,
	Input,
	OnChanges,
	OnDestroy,
	Optional,
	Renderer2,
	Self
} from '@angular/core';
import { FormControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import {
	CoercionHelper,
	getSupportedInputTypes,
	INPUT_VALUE_ACCESSOR,
	Platform
} from '@app/cdk';
import { ErrorStateMatcherService } from '@app/lib/core';
import { BaseFormFieldControl } from '@app/lib/form-field';
import { InputErrors } from './input-errors';



// Invalid input type. Using one of these will throw an MatInputUnsupportedTypeError.
const INPUT_INVALID_TYPES = [
	'button',
	'checkbox',
	'color',
	'file',
	'hidden',
	'image',
	'radio',
	'range',
	'reset',
	'submit'
];



let nextUniqueId = 0;



/** Directive that allows a native input to work inside a `FormFieldComponent`. */
@Directive({
	selector: `input[appInput], textarea[appInput]`,
	exportAs: 'appInput',
	host: {
		'class': 'app-input-element app-form-field-autofill-control',
		// Native input properties that are overwritten by Angular inputs need to be synced with
		// the native input element. Otherwise property bindings for those don't work.
		'[attr.id]': 'id',
		'[placeholder]': 'placeholder',
		'[disabled]': 'disabled',
		'[required]': 'required',
		'[readonly]': 'readonly',
		'[attr.aria-describedby]': '_ariaDescribedby || null',
		'[attr.aria-invalid]': 'errorState',
		'[attr.aria-required]': 'required.toString()',
		'(blur)': '_focusChanged(false)',
		'(focus)': '_focusChanged(true)',
		'(input)': '_onInput()'
	},
	providers: [{ provide: BaseFormFieldControl, useExisting: InputDirective }]
})
export class InputDirective implements BaseFormFieldControl<any>, OnChanges, OnDestroy, DoCheck {
	
	/** Variables used as cache for getters and setters. */
	protected _type = 'text';
	protected _disabled = false;
	protected _required = false;
	protected _id: string;
	protected _uid = `app-input-${nextUniqueId++}`;
	protected _previousNativeValue: any;
	private _readonly = false;
	private _inputValueAccessor: { value: any };

	/** Whether the input is focused. */
	focused = false;

	/** Whether the input is in an error state. */
	errorState = false;

	/** The aria-describedby attribute on the input for improved a11y. */
	_ariaDescribedby: string;

	/**
	 * Stream that emits whenever the state of the input changes such that the wrapping `FormFieldComponent`
	 * needs to run change detection.
	 */
	stateChanges = new Subject<void>();

	/** A name for this control that can be used by `app-form-field`. */
	controlType = 'app-input';

	/** Whether the element is disabled. */
	@Input()
	get disabled() { return this.ngControl ? this.ngControl.disabled : this._disabled; }
	set disabled(value: any) { this._disabled = CoercionHelper.coerceBoolean(value); }

	/** Unique id of the element. */
	@Input()
	get id() { return this._id; }
	set id(value: string) { this._id = value || this._uid; }

	/** Placeholder attribute of the element. */
	@Input() placeholder: string = '';

	/** Whether the element is required. */
	@Input()
	get required() { return this._required; }
	set required(value: any) { this._required = CoercionHelper.coerceBoolean(value); }

	/** Input type of the element. */
	@Input()
	get type() { return this._type; }
	set type(value: string) {
		this._type = value || 'text';
		this._validateType();

		// When using Angular inputs, developers are no longer able to set the properties on the native
		// input element. To ensure that bindings for `type` work, we need to sync the setter
		// with the native property. Textarea elements don't support the type property or attribute.
		if (!this._isTextarea() && getSupportedInputTypes().has(this._type)) {
			this._renderer.setProperty(this._elementRef.nativeElement, 'type', this._type);
		}
	}

	/** An object used to control when error messages are shown. */
	@Input() errorStateMatcherService: ErrorStateMatcherService;

	/** The input element's value. */
	@Input()
	get value(): any { return this._inputValueAccessor.value; }
	set value(value: any) {
		if (value !== this.value) {
			this._inputValueAccessor.value = value;
			this.stateChanges.next();
		}
	}

	/** Whether the element is readonly. */
	@Input()
	get readonly() { return this._readonly; }
	set readonly(value: any) { this._readonly = CoercionHelper.coerceBoolean(value); }

	protected _neverEmptyInputTypes = [
		'date',
		'datetime',
		'datetime-local',
		'month',
		'time',
		'week'
	].filter(t => getSupportedInputTypes().has(t));

	constructor (protected _elementRef: ElementRef,
		protected _renderer: Renderer2,
		protected _platform: Platform,
		@Optional() @Self() public ngControl: NgControl,
		@Optional() protected _parentForm: NgForm,
		@Optional() protected _parentFormGroup: FormGroupDirective,
		private _defaultErrorStateMatcherService: ErrorStateMatcherService,
		@Optional() @Self() @Inject(INPUT_VALUE_ACCESSOR) inputValueAccessor: any) {
		// If no input value accessor was explicitly specified, use the element as the input value
		// accessor.
		this._inputValueAccessor = inputValueAccessor || this._elementRef.nativeElement;

		this._previousNativeValue = this.value;

		// Force setter to be called in case id was not specified.
		this.id = this.id;

		// On some versions of iOS the caret gets stuck in the wrong place when holding down the delete
		// key. In order to get around this we need to "jiggle" the caret loose. Since this bug only
		// exists on iOS, we only bother to install the listener on iOS.
		if (_platform.IOS) {
			_renderer.listen(_elementRef.nativeElement, 'keyup', (event: Event) => {
				let el = event.target as HTMLInputElement;
				if (!el.value && !el.selectionStart && !el.selectionEnd) {
					// Note: Just setting `0, 0` doesn't fix the issue. Setting `1, 1` fixes it for the first
					// time that you type text and then hold delete. Toggling to `1, 1` and then back to
					// `0, 0` seems to completely fix it.
					el.setSelectionRange(1, 1);
					el.setSelectionRange(0, 0);
				}
			});
		}
	}

	ngOnChanges() {
		this.stateChanges.next();
	}

	ngOnDestroy() {
		this.stateChanges.complete();
	}

	ngDoCheck() {
		if (this.ngControl) {
			// We need to re-evaluate this on every change detection cycle, because there are some
			// error triggers that we can't subscribe to (e.g. parent form submissions). This means
			// that whatever logic is in here has to be super lean or we risk destroying the performance.
			this._updateErrorState();
		} else {
			// When the input isn't used together with `@angular/forms`, we need to check manually for
			// changes to the native `value` property in order to update the floating label.
			this._dirtyCheckNativeValue();
		}
	}

	focus() { this._elementRef.nativeElement.focus(); }

	/** Callback for the cases where the focused state of the input changes. */
	_focusChanged(isFocused: boolean) {
		if (isFocused !== this.focused && !this.readonly) {
			this.focused = isFocused;
			this.stateChanges.next();
		}
	}

	_onInput() {
		// This is a noop function and is used to let Angular know whenever the value changes.
		// Angular will run a new change detection each time the `input` event has been dispatched.
		// It's necessary that Angular recognizes the value change, because when floatingLabel
		// is set to false and Angular forms aren't used, the placeholder won't recognize the
		// value changes and will not disappear.
		// Listening to the input event wouldn't be necessary when the input is using the
		// FormsModule or ReactiveFormsModule, because Angular forms also listens to input events.
	}

	/** Re-evaluates the error state. This is only relevant with @angular/forms. */
	protected _updateErrorState() {
		const oldState = this.errorState;
		const parent = this._parentFormGroup || this._parentForm;
		const matcher = this.errorStateMatcherService || this._defaultErrorStateMatcherService;
		const control = this.ngControl ? this.ngControl.control as FormControl : null;
		const newState = matcher.isErrorState(control, parent);

		if (newState !== oldState) {
			this.errorState = newState;
			this.stateChanges.next();
		}
	}

	/** Does some manual dirty checking on the native input `value` property. */
	protected _dirtyCheckNativeValue() {
		const newValue = this.value;

		if (this._previousNativeValue !== newValue) {
			this._previousNativeValue = newValue;
			this.stateChanges.next();
		}
	}

	/** Make sure the input is a supported type. */
	protected _validateType() {
		if (INPUT_INVALID_TYPES.indexOf(this._type) > -1) {
			throw InputErrors.getUnsupportedTypeError(this._type);
		}
	}

	/** Checks whether the input type is one of the types that are never empty. */
	protected _isNeverEmpty() {
		return this._neverEmptyInputTypes.indexOf(this._type) > -1;
	}

	/** Checks whether the input is invalid based on the native validation. */
	protected _isBadInput() {
		// The `validity` property won't be present on platform-server.
		let validity = (this._elementRef.nativeElement as HTMLInputElement).validity;
		return validity && validity.badInput;
	}

	/** Determines if the component host is a textarea. If not recognizable it returns false. */
	protected _isTextarea() {
		let nativeElement = this._elementRef.nativeElement;

		// In Universal, we don't have access to `nodeName`, but the same can be achieved with `name`.
		// Note that this shouldn't be necessary once Angular switches to an API that resembles the
		// DOM closer.
		let nodeName = this._platform.isBrowser ? nativeElement.nodeName : nativeElement.name;
		return nodeName ? nodeName.toLowerCase() === 'textarea' : false;
	}

	// Implemented as part of BaseFormFieldControl.
	get empty(): boolean {
		return !this._isNeverEmpty() &&
			(this.value == null || this.value === '') &&
			// Check if the input contains bad input. If so, we know that it only appears empty because
			// the value failed to parse. From the user's perspective it is not empty.
			// TODO(mmalerba): Add e2e test for bad input case.
			!this._isBadInput();
	}

	// Implemented as part of BaseFormFieldControl.
	get shouldPlaceholderFloat(): boolean { return this.focused || !this.empty; }

	// Implemented as part of BaseFormFieldControl.
	setDescribedByIds(ids: string[]) { this._ariaDescribedby = ids.join(' '); }

	// Implemented as part of BaseFormFieldControl.
	onContainerClick() { this.focus(); }
}
