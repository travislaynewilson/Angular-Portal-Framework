import {
	AfterViewInit,
	Attribute,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	forwardRef,
	Input,
	OnDestroy,
	Output,
	Renderer2,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { 
	CanDisable,
	CoercionHelper,
	DisabledMixin,
	FocusMonitorService, 
	FocusOrigin,
	HasTabIndex,
	TabIndexMixin
} from '@app/cdk';



// Increasing integer for generating unique ids for checkbox components.
let nextUniqueId = 0;



/**
 * Provider Expression that allows app-checkbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 */
export const CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => CheckboxComponent),
	multi: true
};



/** Represents the different states that require custom transitions between them. */
export enum TransitionCheckState {
	/** The initial state of the component before any user interaction. */
	Init,
	/** The state representing the component when it's becoming checked. */
	Checked,
	/** The state representing the component when it's becoming unchecked. */
	Unchecked,
	/** The state representing the component when it's becoming indeterminate. */
	Indeterminate
}



/** Change event object emitted by CheckboxComponent. */
export class CheckboxChangeEvent {
	/** The source CheckboxComponent of the event. */
	source: CheckboxComponent;
	/** The new `checked` value of the checkbox. */
	checked: boolean;
}



// Boilerplate for applying mixins to CheckboxComponent.
export class CheckboxComponentCore {
	constructor (public _renderer: Renderer2, public _elementRef: ElementRef) { }
}
export const BaseCheckboxComponent =
	TabIndexMixin(DisabledMixin(CheckboxComponentCore));

	

/**
 * A checkbox component. Supports all of the functionality of an HTML5 checkbox,
 * and exposes a similar API. A CheckboxComponent can be either checked, unchecked, indeterminate, or
 * disabled. Note that all additional accessibility attributes are taken care of by the component,
 * so there is no need to provide them yourself. However, if you want to omit a label and still
 * have the checkbox be accessible, you may supply an [aria-label] input.
 */
@Component({
	selector: 'app-checkbox',
	templateUrl: 'checkbox.component.html',
	styleUrls: ['checkbox.component.scss'],
	exportAs: 'appCheckbox',
	host: {
		'class': 'app-checkbox',
		'[id]': 'id',
		'[class.app-checkbox-indeterminate]': 'indeterminate',
		'[class.app-checkbox-checked]': 'checked',
		'[class.app-checkbox-disabled]': 'disabled',
		'[class.app-checkbox-label-before]': 'labelPosition == "before"'
	},
	providers: [CHECKBOX_CONTROL_VALUE_ACCESSOR],
	inputs: ['disabled', 'disableRipple', 'color', 'tabIndex'],
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent extends BaseCheckboxComponent implements ControlValueAccessor, AfterViewInit, OnDestroy, CanDisable, HasTabIndex {

	/**
	 * Attached to the aria-label attribute of the host element. In most cases, arial-labelledby will
	 * take precedence so this may be omitted.
	 */
	@Input('aria-label') ariaLabel: string = '';

	/**
	 * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
	 */
	@Input('aria-labelledby') ariaLabelledby: string | null = null;

	/** A unique id for the checkbox input. If none is supplied, it will be auto-generated. */
	private _uniqueId: string = `app-checkbox-${++nextUniqueId}`;
	@Input() id: string = this._uniqueId;

	/** Whether the checkbox is required. */
	@Input()
	get required(): boolean { return this._required; }
	set required(value) { this._required = CoercionHelper.coerceBoolean(value); }
	private _required: boolean;

	/** Whether the label should appear after or before the checkbox. Defaults to 'after' */
	@Input() labelPosition: 'before' | 'after' = 'after';

	/** Name value will be applied to the input element if present */
	@Input() name: string | null = null;

	/** Whether the checkbox is checked. */
	@Input()
	get checked() { return this._checked; }
	set checked(checked: boolean) {
		if (checked != this.checked) {
			this._checked = checked;
			this._changeDetectorRef.markForCheck();
		}
	}
	private _checked: boolean = false;

	/**
	 * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
	 * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
	 * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
	 * set to false.
	 */
	@Input()
	get indeterminate() { return this._indeterminate; }
	set indeterminate(indeterminate: boolean) {
		let changed = indeterminate != this._indeterminate;
		this._indeterminate = indeterminate;

		if (changed) {
			if (this._indeterminate) {
				this._transitionCheckState(TransitionCheckState.Indeterminate);
			} else {
				this._transitionCheckState(
					this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
			}
			this.indeterminateChange.emit(this._indeterminate);
		}
	}
	private _indeterminate: boolean = false;



	/** The native `<input type="checkbox"> element */
	@ViewChild('input') _inputElement: ElementRef;

	/** Returns the unique id for the visual hidden input. */
	get inputId(): string { return `${this.id || this._uniqueId}-input`; }



	/** Event emitted when the checkbox's `checked` value changes. */
	@Output() change: EventEmitter<CheckboxChangeEvent> = new EventEmitter<CheckboxChangeEvent>();

	/** Event emitted when the checkbox's `indeterminate` value changes. */
	@Output() indeterminateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	/** The value attribute of the native input element */
	@Input() value: string;


	/** Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor. */
	onTouched: () => any = () => { };


	private _currentAnimationClass: string = '';
	private _currentCheckState: TransitionCheckState = TransitionCheckState.Init;
	private _controlValueAccessorChangeFn: (value: any) => void = () => { };



	constructor (renderer: Renderer2,
		elementRef: ElementRef,
		private _changeDetectorRef: ChangeDetectorRef,
		private _focusMonitorService: FocusMonitorService,
		@Attribute('tabindex') tabIndex: string) {
		super(renderer, elementRef);

		this.tabIndex = parseInt(tabIndex) || 0;
	}

	ngAfterViewInit() {
		this._focusMonitorService
			.monitor(this._inputElement.nativeElement, false)
			.subscribe(focusOrigin => this._onInputFocusChange(focusOrigin));
	}

	ngOnDestroy() {
		this._focusMonitorService.stopMonitoring(this._inputElement.nativeElement);
	}



	/** 
	 * Method being called whenever the label text changes. 
	 * This method is getting called whenever the label of the checkbox changes.
	 * Since the checkbox uses the OnPush strategy we need to notify it about the change
	 * that has been recognized by the appObserveContent directive.
	 */
	_onLabelTextChange() {
		this._changeDetectorRef.markForCheck();
	}

	/**
	 * Sets the model value. Implemented as part of ControlValueAccessor.
	 * @param value Value to be set to the model.
	 */
	writeValue(value: any) {
		this.checked = !!value;
	}

	/**
	 * Registers a callback to be triggered when the value has changed.
	 * Implemented as part of ControlValueAccessor.
	 * @param fn Function to be called on change.
	 */
	registerOnChange(fn: (value: any) => void) {
		this._controlValueAccessorChangeFn = fn;
	}

	/**
	 * Registers a callback to be triggered when the control has been touched.
	 * Implemented as part of ControlValueAccessor.
	 * @param fn Callback to be triggered when the checkbox is touched.
	 */
	registerOnTouched(fn: any) {
		this.onTouched = fn;
	}

	/**
	 * Sets the checkbox's disabled state. Implemented as a part of ControlValueAccessor.
	 * @param isDisabled Whether the checkbox should be disabled.
	 */
	setDisabledState(isDisabled: boolean) {
		this.disabled = isDisabled;
		this._changeDetectorRef.markForCheck();
	}

	private _transitionCheckState(newState: TransitionCheckState) {
		let oldState = this._currentCheckState;
		let renderer = this._renderer;
		let elementRef = this._elementRef;

		if (oldState === newState) {
			return;
		}
		if (this._currentAnimationClass.length > 0) {
			renderer.removeClass(elementRef.nativeElement, this._currentAnimationClass);
		}

		this._currentAnimationClass = this._getAnimationClassForCheckStateTransition(
			oldState, newState);
		this._currentCheckState = newState;

		if (this._currentAnimationClass.length > 0) {
			renderer.addClass(elementRef.nativeElement, this._currentAnimationClass);
		}
	}

	private _emitChangeEvent() {
		let event = new CheckboxChangeEvent();
		event.source = this;
		event.checked = this.checked;

		this._controlValueAccessorChangeFn(this.checked);
		this.change.emit(event);
	}

	/** Function is called whenever the focus changes for the input element. */
	private _onInputFocusChange(focusOrigin: FocusOrigin) {
		if (!focusOrigin) {
			this.onTouched();
		}
	}

	/** Toggles the `checked` state of the checkbox. */
	toggle(): void {
		this.checked = !this.checked;
	}

	/**
	 * Event handler for checkbox input element.
	 * Toggles checked state if element is not disabled.
	 * Do not toggle on (change) event since IE doesn't fire change event when
	 *   indeterminate checkbox is clicked.
	 * @param event
	 */
	_onInputClick(event: Event) {
		// We have to stop propagation for click events on the visual hidden input element.
		// By default, when a user clicks on a label element, a generated click event will be
		// dispatched on the associated input element. Since we are using a label element as our
		// root container, the click event on the `checkbox` will be executed twice.
		// The real click event will bubble up, and the generated click event also tries to bubble up.
		// This will lead to multiple click events.
		// Preventing bubbling for the second event will solve that issue.
		event.stopPropagation();

		if (!this.disabled) {
			// When user manually click on the checkbox, `indeterminate` is set to false.
			if (this._indeterminate) {
				Promise.resolve().then(() => {
					this._indeterminate = false;
					this.indeterminateChange.emit(this._indeterminate);
				});
			}

			this.toggle();
			this._transitionCheckState(
				this._checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);

			// Emit our custom change event if the native input emitted one.
			// It is important to only emit it, if the native input triggered one, because
			// we don't want to trigger a change event, when the `checked` variable changes for example.
			this._emitChangeEvent();
		}
	}

	/** Focuses the checkbox. */
	focus(): void {
		this._focusMonitorService.focusVia(this._inputElement.nativeElement, 'keyboard');
	}

	_onInteractionEvent(event: Event) {
		// We always have to stop propagation on the change event.
		// Otherwise the change event, from the input element, will bubble up and
		// emit its event object to the `change` output.
		event.stopPropagation();
	}

	private _getAnimationClassForCheckStateTransition(
		oldState: TransitionCheckState, newState: TransitionCheckState): string {
		let animSuffix: string = '';

		switch (oldState) {
			case TransitionCheckState.Init:
				// Handle edge case where user interacts with checkbox that does not have [(ngModel)] or
				// [checked] bound to it.
				if (newState === TransitionCheckState.Checked) {
					animSuffix = 'unchecked-checked';
				} else if (newState == TransitionCheckState.Indeterminate) {
					animSuffix = 'unchecked-indeterminate';
				} else {
					return '';
				}
				break;
			case TransitionCheckState.Unchecked:
				animSuffix = newState === TransitionCheckState.Checked ?
					'unchecked-checked' : 'unchecked-indeterminate';
				break;
			case TransitionCheckState.Checked:
				animSuffix = newState === TransitionCheckState.Unchecked ?
					'checked-unchecked' : 'checked-indeterminate';
				break;
			case TransitionCheckState.Indeterminate:
				animSuffix = newState === TransitionCheckState.Checked ?
					'indeterminate-checked' : 'indeterminate-unchecked';
				break;
		}

		return `app-checkbox-anim-${animSuffix}`;
	}
}
