import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	forwardRef,
	Input,
	OnDestroy,
	OnInit,
	Optional,
	Output,
	Renderer2,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { 
	CoercionHelper,
	FocusMonitorService, 
	FocusOrigin,
	HammerInput,
	KeyCodes
} from '@app/cdk';



/**
 * Visually, a 30px separation between tick marks looks best. This is very subjective but it is
 * the default separation we chose.
 */
const MIN_AUTO_TICK_SEPARATION = 30;



/** The thumb gap size for a disabled slider. */
const DISABLED_THUMB_GAP = 7;



/** The thumb gap size for a non-active slider at its minimum value. */
const MIN_VALUE_NONACTIVE_THUMB_GAP = 7;



/** The thumb gap size for an active slider at its minimum value. */
const MIN_VALUE_ACTIVE_THUMB_GAP = 10;



/**
 * Provider Expression that allows app-slider to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)] and [formControl].
 */
export const SLIDER_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => SliderComponent),
	multi: true
};



/** A simple change event emitted by the Slider component. */
export class SliderChange {

	/** The SliderComponent that changed. */
	source: SliderComponent;

	/** The new value of the source slider. */
	value: number | null;
}



/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
@Component({
	selector: 'app-slider',
	exportAs: 'appSlider',
	providers: [SLIDER_VALUE_ACCESSOR],
	host: {
		'(focus)': '_onFocus()',
		'(blur)': '_onBlur()',
		'(click)': '_onClick($event)',
		'(keydown)': '_onKeydown($event)',
		'(keyup)': '_onKeyup()',
		'(mouseenter)': '_onMouseenter()',
		'(slide)': '_onSlide($event)',
		'(slideend)': '_onSlideEnd()',
		'(slidestart)': '_onSlideStart($event)',
		'class': 'app-slider',
		'role': 'slider',
		'tabindex': '0',
		'[attr.aria-disabled]': 'disabled',
		'[attr.aria-valuemax]': 'max',
		'[attr.aria-valuemin]': 'min',
		'[attr.aria-valuenow]': 'value',
		'[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"',
		'[class.app-slider-disabled]': 'disabled',
		'[class.app-slider-has-ticks]': 'tickInterval',
		'[class.app-slider-horizontal]': '!vertical',
		'[class.app-slider-axis-inverted]': '_invertAxis',
		'[class.app-slider-sliding]': '_isSliding',
		'[class.app-slider-thumb-label-showing]': 'thumbLabel',
		'[class.app-slider-vertical]': 'vertical',
		'[class.app-slider-min-value]': '_isMinValue',
		'[class.app-slider-hide-last-tick]': 'disabled || _isMinValue && _thumbGap && _invertAxis'
	},
	templateUrl: 'slider.component.html',
	styleUrls: ['slider.component.scss'],
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent implements ControlValueAccessor, OnDestroy, OnInit {

	private _disabled: boolean = false;

	get disabled() { return this._disabled; }
	set disabled(value: any) { this._disabled = CoercionHelper.coerceBoolean(value); }


	/** Whether the slider is inverted. */
	@Input()
	get invert() { return this._invert; }
	set invert(value: any) {
		this._invert = CoercionHelper.coerceBoolean(value);
	}
	private _invert = false;

	/** The maximum value that the slider can have. */
	@Input()
	get max() { return this._max; }
	set max(v: number) {
		this._max = CoercionHelper.coerceNumber(v, this._max);
		this._percent = this._calculatePercentage(this._value);

		// Since this also modifies the percentage, we need to let the change detection know.
		this._changeDetectorRef.markForCheck();
	}
	private _max: number = 100;

	/** The minimum value that the slider can have. */
	@Input()
	get min() { return this._min; }
	set min(v: number) {
		this._min = CoercionHelper.coerceNumber(v, this._min);

		// If the value wasn't explicitly set by the user, set it to the min.
		if (this._value === null) {
			this.value = this._min;
		}
		this._percent = this._calculatePercentage(this._value);

		// Since this also modifies the percentage, we need to let the change detection know.
		this._changeDetectorRef.markForCheck();
	}
	private _min: number = 0;

	/** The values at which the thumb will snap. */
	@Input()
	get step() { return this._step; }
	set step(v: number) {
		this._step = CoercionHelper.coerceNumber(v, this._step);

		if (this._step % 1 !== 0) {
			this._roundLabelTo = this._step.toString().split('.').pop()!.length;
		}

		// Since this could modify the label, we need to notify the change detection.
		this._changeDetectorRef.markForCheck();
	}
	private _step: number = 1;

	/** Whether or not to show the thumb label. */
	@Input()
	get thumbLabel(): boolean { return this._thumbLabel; }
	set thumbLabel(value) { this._thumbLabel = CoercionHelper.coerceBoolean(value); }
	private _thumbLabel: boolean = true;

	/**
	 * How often to show ticks. Relative to the step so that a tick always appears on a step.
	 * Ex: Tick interval of 4 with a step of 3 will draw a tick every 4 steps (every 12 values).
	 */
	@Input()
	get tickInterval() { return this._tickInterval; }
	set tickInterval(value: 'auto' | number) {
		if (value === 'auto') {
			this._tickInterval = 'auto';
		} else if (typeof value === 'number' || typeof value === 'string') {
			this._tickInterval = CoercionHelper.coerceNumber(value, this._tickInterval as number);
		} else {
			this._tickInterval = 0;
		}
	}
	private _tickInterval: 'auto' | number = 0;

	/** Value of the slider. */
	@Input()
	get value() {
		// If the value needs to be read and it is still uninitialized, initialize it to the min.
		if (this._value === null) {
			this.value = this._min;
		}
		return this._value;
	}
	set value(v: number | null) {
		if (v !== this._value) {
			this._value = CoercionHelper.coerceNumber(v, this._value || 0);
			this._percent = this._calculatePercentage(this._value);

			// Since this also modifies the percentage, we need to let the change detection know.
			this._changeDetectorRef.markForCheck();
		}
	}
	private _value: number | null = null;

	/** Whether the slider is vertical. */
	@Input()
	get vertical() { return this._vertical; }
	set vertical(value: any) {
		this._vertical = CoercionHelper.coerceBoolean(value);
	}
	private _vertical = false;

	/** Event emitted when the slider value has changed. */
	@Output() change = new EventEmitter<SliderChange>();

	/** Event emitted when the slider thumb moves. */
	@Output() input = new EventEmitter<SliderChange>();

	/** The value to be used for display purposes. */
	get displayValue(): string | number {
		if (this._roundLabelTo && this.value && this.value % 1 !== 0) {
			return this.value.toFixed(this._roundLabelTo);
		}

		return this.value || 0;
	}

	/** onTouch function registered via registerOnTouch (ControlValueAccessor). */
	onTouched: () => any = () => { };

	/** The percentage of the slider that coincides with the value. */
	get percent(): number { return this._clamp(this._percent); }
	private _percent: number = 0;

	/**
	 * Whether or not the thumb is sliding.
	 * Used to determine if there should be a transition for the thumb and fill track.
	 */
	_isSliding: boolean = false;

	/**
	 * Whether or not the slider is active (clicked or sliding).
	 * Used to shrink and grow the thumb.
	 */
	_isActive: boolean = false;

	/**
	 * Whether the axis of the slider is inverted.
	 * (i.e. whether moving the thumb in the positive x or y direction decreases the slider's value).
	 */
	get _invertAxis() {
		// Standard non-inverted mode for a vertical slider should be dragging the thumb from bottom to
		// top. However from a y-axis standpoint this is inverted.
		return this.vertical ? !this.invert : this.invert;
	}


	/** Whether the slider is at its minimum value. */
	get _isMinValue() {
		return this.percent === 0;
	}

	/**
	 * The amount of space to leave between the slider thumb and the track fill & track background
	 * elements.
	 */
	get _thumbGap() {
		if (this.disabled) {
			return DISABLED_THUMB_GAP;
		}
		if (this._isMinValue && !this.thumbLabel) {
			return this._isActive ? MIN_VALUE_ACTIVE_THUMB_GAP : MIN_VALUE_NONACTIVE_THUMB_GAP;
		}
		return 0;
	}

	/** CSS styles for the track background element. */
	get _trackBackgroundStyles(): { [key: string]: string } {
		let axis = this.vertical ? 'Y' : 'X';
		let sign = this._invertMouseCoords ? '-' : '';
		return {
			'transform': `translate${axis}(${sign}${this._thumbGap}px) scale${axis}(${1 - this.percent})`
		};
	}

	/** CSS styles for the track fill element. */
	get _trackFillStyles(): { [key: string]: string } {
		let axis = this.vertical ? 'Y' : 'X';
		let sign = this._invertMouseCoords ? '' : '-';
		return {
			'transform': `translate${axis}(${sign}${this._thumbGap}px) scale${axis}(${this.percent})`
		};
	}

	/** CSS styles for the ticks container element. */
	get _ticksContainerStyles(): { [key: string]: string } {
		let axis = this.vertical ? 'Y' : 'X';
		let sign = !this.vertical && '-';
		let offset = this._tickIntervalPercent / 2 * 100;
		return {
			'transform': `translate${axis}(${sign}${offset}%)`
		};
	}

	/** CSS styles for the ticks element. */
	get _ticksStyles(): { [key: string]: string } {
		let tickSize = this._tickIntervalPercent * 100;
		let backgroundSize = this.vertical ? `2px ${tickSize}%` : `${tickSize}% 2px`;
		let axis = this.vertical ? 'Y' : 'X';
		// Depending on the direction we pushed the ticks container, push the ticks the opposite
		// direction to re-center them but clip off the end edge. 
		let sign = !this.vertical && '';
		let rotate = !this.vertical && '';
		let styles: { [key: string]: string } = {
			'backgroundSize': backgroundSize,
			// Without translateZ ticks sometimes jitter as the slider moves on Chrome & Firefox.
			'transform': `translateZ(0) translate${axis}(${sign}${tickSize / 2}%)${rotate}`
		};

		if (this._isMinValue && this._thumbGap) {
			let side = this.vertical ?
				(this._invertAxis ? 'Bottom' : 'Top') :
				(this._invertAxis ? 'Right' : 'Left');
			styles[`padding${side}`] = `${this._thumbGap}px`;
		}

		return styles;
	}

	get _thumbContainerStyles(): { [key: string]: string } {
		let axis = this.vertical ? 'Y' : 'X';
		// For a horizontal slider in RTL languages we push the thumb container off the left edge
		// instead of the right edge to avoid causing a horizontal scrollbar to appear.
		let invertOffset = !this.vertical ? this._invertAxis : !this._invertAxis;
		let offset = (invertOffset ? this.percent : 1 - this.percent) * 100;
		return {
			'transform': `translate${axis}(-${offset}%)`
		};
	}

	/** The size of a tick interval as a percentage of the size of the track. */
	private _tickIntervalPercent: number = 0;

	/** The dimensions of the slider. */
	private _sliderDimensions: ClientRect | null = null;

	private _controlValueAccessorChangeFn: (value: any) => void = () => { };

	/** Decimal places to round to, based on the step amount. */
	private _roundLabelTo: number;

	/** Subscription to the Directionality change EventEmitter. */
	private _dirChangeSubscription = Subscription.EMPTY;

	/** The value of the slider when the slide start event fires. */
	private _valueOnSlideStart: number | null;

	/** Reference to the inner slider wrapper element. */
	@ViewChild('sliderWrapper') private _sliderWrapper: ElementRef;

	/**
	 * Whether mouse events should be converted to a slider position by calculating their distance
	 * from the right or bottom edge of the slider as opposed to the top or left.
	 */
	private get _invertMouseCoords() {
		return (!this.vertical) ? this._invertAxis : !this._invertAxis;
	}


	constructor (private _renderer: Renderer2,
		private _elementRef: ElementRef,
		private _focusMonitorService: FocusMonitorService,
		private _changeDetectorRef: ChangeDetectorRef) { }

	ngOnInit() {
		this._focusMonitorService
			.monitor(this._elementRef.nativeElement, true)
			.subscribe((origin: FocusOrigin) => {
				this._isActive = !!origin && origin !== 'keyboard';
				this._changeDetectorRef.detectChanges();
			});
	}

	ngOnDestroy() {
		this._focusMonitorService.stopMonitoring(this._elementRef.nativeElement);
		this._dirChangeSubscription.unsubscribe();
	}

	_onMouseenter() {
		if (this.disabled) {
			return;
		}

		// We save the dimensions of the slider here so we can use them to update the spacing of the
		// ticks and determine where on the slider click and slide events happen.
		this._sliderDimensions = this._getSliderDimensions();
		this._updateTickIntervalPercent();
	}

	_onClick(event: MouseEvent) {
		if (this.disabled) {
			return;
		}

		let oldValue = this.value;
		this._isSliding = false;
		this._focusHostElement();
		this._updateValueFromPosition({ x: event.clientX, y: event.clientY });

		/* Emit a change and input event if the value changed. */
		if (oldValue != this.value) {
			this._emitInputEvent();
			this._emitChangeEvent();
		}
	}

	_onSlide(event: HammerInput) {
		if (this.disabled) {
			return;
		}

		// The slide start event sometimes fails to fire on iOS, so if we're not already in the sliding
		// state, call the slide start handler manually.
		if (!this._isSliding) {
			this._onSlideStart(null);
		}

		// Prevent the slide from selecting anything else.
		event.preventDefault();

		let oldValue = this.value;
		this._updateValueFromPosition({ x: event.center.x, y: event.center.y });

		// Native range elements always emit `input` events when the value changed while sliding.
		if (oldValue != this.value) {
			this._emitInputEvent();
		}
	}

	_onSlideStart(event: HammerInput | null) {
		if (this.disabled || this._isSliding) {
			return;
		}

		// Simulate mouseenter in case this is a mobile device.
		this._onMouseenter();

		this._isSliding = true;
		this._focusHostElement();
		this._valueOnSlideStart = this.value;

		if (event) {
			this._updateValueFromPosition({ x: event.center.x, y: event.center.y });
			event.preventDefault();
		}
	}

	_onSlideEnd() {
		this._isSliding = false;

		if (this._valueOnSlideStart != this.value) {
			this._emitChangeEvent();
		}
		this._valueOnSlideStart = null;
	}

	_onFocus() {
		// We save the dimensions of the slider here so we can use them to update the spacing of the
		// ticks and determine where on the slider click and slide events happen.
		this._sliderDimensions = this._getSliderDimensions();
		this._updateTickIntervalPercent();
	}

	_onBlur() {
		this.onTouched();
	}

	_onKeydown(event: KeyboardEvent) {
		if (this.disabled) { return; }

		let oldValue = this.value;

		switch (event.keyCode) {
			case KeyCodes.PAGE_UP:
				this._increment(10);
				break;
			case KeyCodes.PAGE_DOWN:
				this._increment(-10);
				break;
			case KeyCodes.END:
				this.value = this.max;
				break;
			case KeyCodes.HOME:
				this.value = this.min;
				break;
			case KeyCodes.LEFT_ARROW:
				this._increment(-1);
				break;
			case KeyCodes.UP_ARROW:
				this._increment(1);
				break;
			case KeyCodes.RIGHT_ARROW:
				this._increment(1);
				break;
			case KeyCodes.DOWN_ARROW:
				this._increment(-1);
				break;
			default:
				// Return if the key is not one that we explicitly handle to avoid calling preventDefault on it.
				return;
		}

		if (oldValue != this.value) {
			this._emitInputEvent();
			this._emitChangeEvent();
		}

		this._isSliding = true;
		event.preventDefault();
	}

	_onKeyup() {
		this._isSliding = false;
	}

	/** Increments the slider by the given number of steps (negative number decrements). */
	private _increment(numSteps: number) {
		this.value = this._clamp((this.value || 0) + this.step * numSteps, this.min, this.max);
	}

	/** Calculate the new value from the new physical location. The value will always be snapped. */
	private _updateValueFromPosition(pos: { x: number, y: number }) {
		if (!this._sliderDimensions) {
			return;
		}

		let offset = this.vertical ? this._sliderDimensions.top : this._sliderDimensions.left;
		let size = this.vertical ? this._sliderDimensions.height : this._sliderDimensions.width;
		let posComponent = this.vertical ? pos.y : pos.x;

		// The exact value is calculated from the event and used to find the closest snap value.
		let percent = this._clamp((posComponent - offset) / size);
		if (this._invertMouseCoords) {
			percent = 1 - percent;
		}
		let exactValue = this._calculateValue(percent);

		// This calculation finds the closest step by finding the closest whole number divisible by the
		// step relative to the min.
		let closestValue = Math.round((exactValue - this.min) / this.step) * this.step + this.min;

		// The value needs to snap to the min and max.
		this.value = this._clamp(closestValue, this.min, this.max);
	}

	/** Emits a change event if the current value is different from the last emitted value. */
	private _emitChangeEvent() {
		this._controlValueAccessorChangeFn(this.value);
		this.change.emit(this._createChangeEvent());
	}

	/** Emits an input event when the current value is different from the last emitted value. */
	private _emitInputEvent() {
		this.input.emit(this._createChangeEvent());
	}

	/** Updates the amount of space between ticks as a percentage of the width of the slider. */
	private _updateTickIntervalPercent() {
		if (!this.tickInterval || !this._sliderDimensions) {
			return;
		}

		if (this.tickInterval == 'auto') {
			let trackSize = this.vertical ? this._sliderDimensions.height : this._sliderDimensions.width;
			let pixelsPerStep = trackSize * this.step / (this.max - this.min);
			let stepsPerTick = Math.ceil(MIN_AUTO_TICK_SEPARATION / pixelsPerStep);
			let pixelsPerTick = stepsPerTick * this.step;
			this._tickIntervalPercent = pixelsPerTick / trackSize;
		} else {
			this._tickIntervalPercent = this.tickInterval * this.step / (this.max - this.min);
		}
	}

	/** Creates a slider change object from the specified value. */
	private _createChangeEvent(value = this.value): SliderChange {
		let event = new SliderChange();

		event.source = this;
		event.value = value;

		return event;
	}

	/** Calculates the percentage of the slider that a value is. */
	private _calculatePercentage(value: number | null) {
		return ((value || 0) - this.min) / (this.max - this.min);
	}

	/** Calculates the value a percentage of the slider corresponds to. */
	private _calculateValue(percentage: number) {
		return this.min + percentage * (this.max - this.min);
	}

	/** Return a number between two numbers. */
	private _clamp(value: number, min = 0, max = 1) {
		return Math.max(min, Math.min(value, max));
	}

	/**
	 * Get the bounding client rect of the slider track element.
	 * The track is used rather than the native element to ignore the extra space that the thumb can
	 * take up.
	 */
	private _getSliderDimensions() {
		return this._sliderWrapper ? this._sliderWrapper.nativeElement.getBoundingClientRect() : null;
	}

	/**
	 * Focuses the native element.
	 * Currently only used to allow a blur event to fire but will be used with keyboard input later.
	 */
	private _focusHostElement() {
		this._elementRef.nativeElement.focus();
	}

	/**
	 * Sets the model value. Implemented as part of ControlValueAccessor.
	 * @param value
	 */
	writeValue(value: any) {
		this.value = value;
	}

	/**
	 * Registers a callback to eb triggered when the value has changed.
	 * Implemented as part of ControlValueAccessor.
	 * @param fn Callback to be registered.
	 */
	registerOnChange(fn: (value: any) => void) {
		this._controlValueAccessorChangeFn = fn;
	}

	/**
	 * Registers a callback to be triggered when the component is touched.
	 * Implemented as part of ControlValueAccessor.
	 * @param fn Callback to be registered.
	 */
	registerOnTouched(fn: any) {
		this.onTouched = fn;
	}

	/**
	 * Sets whether the component should be disabled.
	 * Implemented as part of ControlValueAccessor.
	 * @param isDisabled
	 */
	setDisabledState(isDisabled: boolean) {
		this.disabled = isDisabled;
	}
}
