import {
	AfterContentInit,
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
	ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitorService, FocusOrigin } from '@app/core/a11y';
import { CoercionHelper } from '@app/core/util';
import { Platform } from '@app/core/platform';
import {
	CanDisable,
	DisabledMixin,
	HasTabIndex,
	TabIndexMixin
} from '@app/lib/ui/core/mixins';
import {HammerInput} from '@app/core/gestures';
import { applyCssTransform } from '@app/lib/ui/core/style';
import {SlideToggleRenderer} from './slide-toggle-renderer';



// Increasing integer for generating unique ids for slide-toggle components.
let nextUniqueId = 0;



export const SLIDE_TOGGLE_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => SlideToggleComponent),
	multi: true
};



/** Change event object emitted by a SlideToggleComponent. */
export class SlideToggleChangeEvent {
	source: SlideToggleComponent;
	checked: boolean;
}



// Boilerplate for applying mixins to SlideToggleComponent.
export class SlideToggleComponentCore {
	constructor (public _renderer: Renderer2, public _elementRef: ElementRef) { }
}
export const BaseSlideToggleComponent = TabIndexMixin(DisabledMixin(SlideToggleComponentCore));



/** Represents a slidable "switch" toggle that can be moved between on and off. */
@Component({
	selector: 'app-slide-toggle',
	exportAs: 'appSlideToggle',
	host: {
		'class': 'app-slide-toggle app-primary',
		'[id]': 'id',
		'[class.app-checked]': 'checked',
		'[class.app-disabled]': 'disabled',
		'[class.app-slide-toggle-label-before]': 'labelPosition == "before"'
	},
	templateUrl: 'slide-toggle.component.html',
	styleUrls: ['slide-toggle.component.scss'],
	providers: [SLIDE_TOGGLE_VALUE_ACCESSOR],
	inputs: ['disabled', 'disableRipple', 'color', 'tabIndex'],
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideToggleComponent extends BaseSlideToggleComponent implements OnDestroy, AfterContentInit, ControlValueAccessor, CanDisable, HasTabIndex {

	private onChange = (_: any) => { };
	private onTouched = () => { };

	private _uniqueId: string = `app-slide-toggle-${++nextUniqueId}`;
	private _slideRenderer: SlideToggleRenderer;
	private _required: boolean = false;
	private _checked: boolean = false;

	/** Name value will be applied to the input element if present */
	@Input() name: string | null = null;

	/** A unique id for the slide-toggle input. If none is supplied, it will be auto-generated. */
	@Input() id: string = this._uniqueId;

	/** Whether the label should appear after or before the slide-toggle. Defaults to 'after' */
	@Input() labelPosition: 'before' | 'after' = 'after';

	/** Whether the slide-toggle element is checked or not */

	/** Used to set the aria-label attribute on the underlying input element. */
	@Input('aria-label') ariaLabel: string | null = null;

	/** Used to set the aria-labelledby attribute on the underlying input element. */
	@Input('aria-labelledby') ariaLabelledby: string | null = null;

	/** Whether the slide-toggle is required. */
	@Input()
	get required (): boolean { return this._required; }
	set required (value) { this._required = CoercionHelper.coerceBoolean(value); }

	/** Whether the slide-toggle element is checked or not */
	@Input()
	get checked (): boolean { return this._checked; }
	set checked (value) {
		this._checked =  CoercionHelper.coerceBoolean(value);
		this._changeDetectorRef.markForCheck();
	}
	/** An event will be dispatched each time the slide-toggle changes its value. */
	@Output() change: EventEmitter<SlideToggleChangeEvent> = new EventEmitter<SlideToggleChangeEvent>();

	/** Returns the unique id for the visual hidden input. */
	get inputId (): string { return `${this.id || this._uniqueId}-input`; }

	/** Reference to the underlying input element. */
	@ViewChild('input') _inputElement: ElementRef;

	constructor (elementRef: ElementRef,
		renderer: Renderer2,
		private _platform: Platform,
		private _focusMonitorService: FocusMonitorService,
		private _changeDetectorRef: ChangeDetectorRef,
		@Attribute('tabindex') tabIndex: string) {
		super(renderer, elementRef);

		this.tabIndex = parseInt(tabIndex) || 0;
	}

	ngAfterContentInit () {
		this._slideRenderer = new SlideToggleRenderer(this._elementRef, this._platform);

		this._focusMonitorService.monitor(this._inputElement.nativeElement, false)
			.subscribe(focusOrigin => this._onInputFocusChange(focusOrigin));
	}

	ngOnDestroy () {
		this._focusMonitorService.stopMonitoring(this._inputElement.nativeElement);
	}

	/**
	 * This function will called if the underlying input changed its value through user interaction.
	 */
	_onChangeEvent (event: Event) {
		// We always have to stop propagation on the change event.
		// Otherwise the change event, from the input element, will bubble up and
		// emit its event object to the component's `change` output.
		event.stopPropagation();

		// Sync the value from the underlying input element with the slide-toggle component.
		this.checked = this._inputElement.nativeElement.checked;

		// Emit our custom change event if the native input emitted one.
		// It is important to only emit it, if the native input triggered one, because we don't want
		// to trigger a change event, when the `checked` variable changes programmatically.
		this._emitChangeEvent();
	}

	_onInputClick (event: Event) {
		// In some situations the user will release the mouse on the label element. The label element
		// redirects the click to the underlying input element and will result in a value change.
		// Prevent the default behavior if dragging, because the value will be set after drag.
		if (this._slideRenderer.dragging) {
			event.preventDefault();
		}

		// We have to stop propagation for click events on the visual hidden input element.
		// By default, when a user clicks on a label element, a generated click event will be
		// dispatched on the associated input element. Since we are using a label element as our
		// root container, the click event on the `slide-toggle` will be executed twice.
		// The real click event will bubble up, and the generated click event also tries to bubble up.
		// This will lead to multiple click events.
		// Preventing bubbling for the second event will solve that issue.
		event.stopPropagation();
	}

	/** Implemented as part of ControlValueAccessor. */
	writeValue (value: any): void {
		this.checked = !!value;
	}

	/** Implemented as part of ControlValueAccessor. */
	registerOnChange (fn: any): void {
		this.onChange = fn;
	}

	/** Implemented as part of ControlValueAccessor. */
	registerOnTouched (fn: any): void {
		this.onTouched = fn;
	}

	/** Implemented as a part of ControlValueAccessor. */
	setDisabledState (isDisabled: boolean): void {
		this.disabled = isDisabled;
		this._changeDetectorRef.markForCheck();
	}

	/** Focuses the slide-toggle. */
	focus () {
		this._focusMonitorService.focusVia(this._inputElement.nativeElement, 'keyboard');
	}

	/** Toggles the checked state of the slide-toggle. */
	toggle () {
		this.checked = !this.checked;
	}

	/** Function is called whenever the focus changes for the input element. */
	private _onInputFocusChange (focusOrigin: FocusOrigin) {
		if (!focusOrigin) {
			this.onTouched();
		}
	}

	/**
	 * Emits a change event on the `change` output. Also notifies the FormControl about the change.
	 */
	private _emitChangeEvent () {
		let event = new SlideToggleChangeEvent();
		event.source = this;
		event.checked = this.checked;
		this.onChange(this.checked);
		this.change.emit(event);
	}

	_onDragStart () {
		if (!this.disabled) {
			this._slideRenderer.startThumbDrag(this.checked);
		}
	}

	_onDrag (event: HammerInput) {
		if (this._slideRenderer.dragging) {
			this._slideRenderer.updateThumbPosition(event.deltaX);
		}
	}

	_onDragEnd () {
		if (this._slideRenderer.dragging) {
			let _previousChecked = this.checked;
			this.checked = this._slideRenderer.dragPercentage > 50;

			if (_previousChecked !== this.checked) {
				this._emitChangeEvent();
			}

			// The drag should be stopped outside of the current event handler, because otherwise the
			// click event will be fired before and will revert the drag change.
			setTimeout(() => this._slideRenderer.stopThumbDrag());
		}
	}

	/** Method being called whenever the label text changes. */
	_onLabelTextChange () {
		// This method is getting called whenever the label of the slide-toggle changes.
		// Since the slide-toggle uses the OnPush strategy we need to notify it about the change
		// that has been recognized by the cdkObserveContent directive.
		this._changeDetectorRef.markForCheck();
	}
}
