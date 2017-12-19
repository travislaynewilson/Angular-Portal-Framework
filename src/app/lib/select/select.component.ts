import {
	AfterContentInit,
	Attribute,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ContentChildren,
	Directive,
	DoCheck,
	ElementRef,
	EventEmitter,
	Inject,
	InjectionToken,
	Input,
	isDevMode,
	NgZone,
	OnChanges,
	OnDestroy,
	OnInit,
	Optional,
	Output,
	QueryList,
	Renderer2,
	Self,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import {
	ControlValueAccessor,
	FormControl,
	FormGroupDirective,
	NgControl,
	NgForm
} from '@angular/forms';
import { filter } from 'rxjs/operators/filter';
import { first } from 'rxjs/operators/first';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { Subject } from 'rxjs/Subject';
import {
	ActiveDescendantKeyManager,
	ConnectedOverlayDirective,
	CoercionHelper,
	KeyCodes,
	OverlayService,
	RepositionScrollStrategy,
	ScrollStrategy,
	SelectionContext,
	ViewportService
} from '@app/cdk';
import {
	CanDisable,
	ErrorStateMatcherService,
	HasTabIndex,
	OptgroupComponent,
	OptionComponent,
	OptionSelectionChangeEvent,
	DisabledMixin,
	TabIndexMixin,
	OPTION_PARENT_COMPONENT
} from '@app/lib/core';
import { FormFieldComponent, BaseFormFieldControl } from '@app/lib/form-field';
import { fadeInContent, transformPanel } from './select-animations';
import { SelectErrors } from './select-errors';
import { SelectChangeEvent } from './select-change.event';
import { SelectTriggerDirective } from './select-trigger.directive';
import { SELECT_SCROLL_STRATEGY } from './select-scroll.strategy';



let nextUniqueId = 0;



/**
 * The following style constants are necessary to save here in order
 * to properly calculate the alignment of the selected option over
 * the trigger element.
 */

/** The max height of the select's overlay panel */
export const SELECT_PANEL_MAX_HEIGHT = 256;



/** The panel's padding on the x-axis */
export const SELECT_PANEL_PADDING_X = 16;


/** The panel's padding on the y-axis */
export const SELECT_PANEL_PADDING_Y = 8;



/** The panel's x axis padding if it is indented (e.g. there is an option group). */
export const SELECT_PANEL_INDENT_PADDING_X = SELECT_PANEL_PADDING_X * 2;



/** The height of the select items in `em` units. */
export const SELECT_ITEM_HEIGHT_EM = 3;
export const SELECT_ITEM_HEIGHT_PX = 35;



/**
 * Distance between the panel edge and the option text in
 * multi-selection mode.
 *
 * (SELECT_PANEL_PADDING_X * 1.5) + 20 = 44
 * The padding is multiplied by 1.5 because the checkbox's margin is half the padding.
 * The checkbox width is 20px.
 */
export const SELECT_MULTIPLE_PANEL_PADDING_X = SELECT_PANEL_PADDING_X * 1.5 + 20;



/**
 * The select panel will only "fit" inside the viewport if it is positioned at
 * this value or more away from the viewport boundary.
 */
export const SELECT_PANEL_VIEWPORT_PADDING = 8;



// Boilerplate for applying mixins to SelectComponent.
export class SelectComponentCore {
	constructor (public _renderer: Renderer2, public _elementRef: ElementRef) { }
}
export const BaseSelectComponent = TabIndexMixin(DisabledMixin(SelectComponentCore));



@Component({
	selector: 'app-select',
	exportAs: 'appSelect',
	templateUrl: './select.component.html',
	styleUrls: ['./select.component.scss'],
	inputs: ['disabled', 'tabIndex'],
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'role': 'listbox',
		'[attr.id]': 'id',
		'[attr.tabindex]': 'tabIndex',
		'[attr.aria-label]': '_ariaLabel',
		'[attr.aria-labelledby]': 'ariaLabelledby',
		'[attr.aria-required]': 'required.toString()',
		'[attr.aria-disabled]': 'disabled.toString()',
		'[attr.aria-invalid]': 'errorState',
		'[attr.aria-owns]': '_optionIds',
		'[attr.aria-multiselectable]': 'multiple',
		'[attr.aria-describedby]': '_ariaDescribedby || null',
		'[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
		'[class.app-select-disabled]': 'disabled',
		'[class.app-select-invalid]': 'errorState',
		'[class.app-select-required]': 'required',
		'class': 'app-select',
		'(keydown)': '_handleKeydown($event)',
		'(focus)': '_onFocus()',
		'(blur)': '_onBlur()'
	},
	animations: [
		transformPanel,
		fadeInContent
	],
	providers: [
		{ provide: BaseFormFieldControl, useExisting: SelectComponent },
		{ provide: OPTION_PARENT_COMPONENT, useExisting: SelectComponent }
	]
})
export class SelectComponent extends BaseSelectComponent implements AfterContentInit, OnChanges,
	OnDestroy, OnInit, DoCheck, ControlValueAccessor, CanDisable, HasTabIndex,
	BaseFormFieldControl<any> {

	/** Whether or not the overlay panel is open. */
	private _panelOpen = false;

	/** Whether filling out the select is required in the form.  */
	private _required: boolean = false;

	/** The scroll position of the overlay panel, calculated to center the selected option. */
	private _scrollTop = 0;

	/** The placeholder displayed in the trigger of the select. */
	private _placeholder: string;

	/** Whether the component is in multiple selection mode. */
	private _multiple: boolean = false;

	/** Comparison function to specify which option is displayed. Defaults to object equality. */
	private _compareWith = (o1: any, o2: any) => o1 === o2;

	/** Unique id for this input. */
	private _uid = `app-select-${nextUniqueId++}`;

	/** Emits whenever the component is destroyed. */
	private _destroy = new Subject<void>();

	/** The last measured value for the trigger's client bounding rect. */
	_triggerRect: ClientRect;

	/** The aria-describedby attribute on the select for improved a11y. */
	_ariaDescribedby: string;

	/** The cached font-size of the trigger element. */
	_triggerFontSize = 0;

	/** Deals with the selection logic. */
	_selectionContext: SelectionContext<OptionComponent>;

	/** Manages keyboard events for options in the panel. */
	_keyManager: ActiveDescendantKeyManager<OptionComponent>;

	/** View -> model callback called when value changes */
	_onChange: (value: any) => void = () => { };

	/** View -> model callback called when select has been touched */
	_onTouched = () => { };

	/** The IDs of child options to be passed to the aria-owns attribute. */
	_optionIds: string = '';

	/** The value of the select panel's transform-origin property. */
	_transformOrigin: string = 'top';

	/** Whether the panel's animation is done. */
	_panelDoneAnimating: boolean = false;

	/** Strategy that will be used to handle scrolling while the select panel is open. */
	_scrollStrategy = this._scrollStrategyFactory();

	/**
	 * The y-offset of the overlay panel in relation to the trigger's top start corner.
	 * This must be adjusted to align the selected option text over the trigger text.
	 * when the panel opens. Will change based on the y-position of the selected option.
	 */
	_offsetY = 0;

	/**
	 * This position config ensures that the top "start" corner of the overlay
	 * is aligned with with the top "start" of the origin by default (overlapping
	 * the trigger completely). If the panel cannot fit below the trigger, it
	 * will fall back to a position above the trigger.
	 */
	_positions = [
		{
			originX: 'start',
			originY: 'top',
			overlayX: 'start',
			overlayY: 'top'
		},
		{
			originX: 'start',
			originY: 'bottom',
			overlayX: 'start',
			overlayY: 'bottom'
		}
	];

	/**
	 * Stream that emits whenever the state of the select changes such that the wrapping
	 * `FormFieldComponent` needs to run change detection.
	 */
	stateChanges = new Subject<void>();

	/** Whether the select is focused. */
	focused = false;

	/** A name for this control that can be used by `app-form-field`. */
	controlType = 'app-select';

	/** Trigger that opens the select. */
	@ViewChild('trigger') trigger: ElementRef;

	/** Panel containing the select options. */
	@ViewChild('panel') panel: ElementRef;

	/** Overlay pane containing the options. */
	@ViewChild(ConnectedOverlayDirective) overlayDir: ConnectedOverlayDirective;

	/** All of the defined select options. */
	@ContentChildren(OptionComponent, { descendants: true }) options: QueryList<OptionComponent>;

	/** All of the defined groups of options. */
	@ContentChildren(OptgroupComponent) optionGroups: QueryList<OptgroupComponent>;

	/** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
	@Input() panelClass: string | string[] | Set<string> | { [key: string]: any };

	/** User-supplied override of the trigger element. */
	@ContentChild(SelectTriggerDirective) customTrigger: SelectTriggerDirective;

	/** Placeholder to be shown if no value has been selected. */
	@Input()
	get placeholder() { return this._placeholder; }
	set placeholder(value: string) {
		this._placeholder = value;
		this.stateChanges.next();
	}

	/** Whether the component is required. */
	@Input()
	get required() { return this._required; }
	set required(value: any) {
		this._required = CoercionHelper.coerceBoolean(value);
		this.stateChanges.next();
	}

	/** Whether the user should be allowed to select multiple options. */
	@Input()
	get multiple(): boolean { return this._multiple; }
	set multiple(value: boolean) {
		if (this._selectionContext) {
			throw SelectErrors.getDynamicMultipleError();
		}

		this._multiple = CoercionHelper.coerceBoolean(value);
	}

	/**
	 * A function to compare the option values with the selected values. The first argument
	 * is a value from an option. The second is a value from the selection. A boolean
	 * should be returned.
	 */
	@Input()
	get compareWith() { return this._compareWith; }
	set compareWith(fn: (o1: any, o2: any) => boolean) {
		if (typeof fn !== 'function') {
			throw SelectErrors.getNonFunctionValueError();
		}
		this._compareWith = fn;
		if (this._selectionContext) {
			// A different comparator means the selection could change.
			this._initializeSelection();
		}
	}

	/** Value of the select control. */
	@Input()
	get value() { return this._value; }
	set value(newValue: any) {
		if (newValue !== this._value) {
			this.writeValue(newValue);
			this._value = newValue;
		}
	}
	private _value: any;

	/** Whether ripples for all options in the select are disabled. */
	@Input()
	get disableRipple(): boolean { return this._disableRipple; }
	set disableRipple(value: boolean) {
		this._disableRipple = CoercionHelper.coerceBoolean(value);
	}
	private _disableRipple: boolean = false;

	/** Aria label of the select. If not specified, the placeholder will be used as label. */
	@Input('aria-label') ariaLabel: string = '';

	/** Input that can be used to specify the `aria-labelledby` attribute. */
	@Input('aria-labelledby') ariaLabelledby: string;

	/** An object used to control when error messages are shown. */
	@Input() errorStateMatcherService: ErrorStateMatcherService;

	/** Unique id of the element. */
	@Input()
	get id() { return this._id; }
	set id(value: string) {
		this._id = value || this._uid;
		this.stateChanges.next();
	}
	private _id: string;

	/** Combined stream of all of the child options' change events. */
	get optionSelectionChanges(): Observable<OptionSelectionChangeEvent> {
		return merge(...this.options.map(option => option.onSelectionChange));
	}

	/** Event emitted when the select has been opened. */
	@Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	/** Event emitted when the select has been opened. */
	@Output('opened')
	get _openedStream(): Observable<void> {
		return this.openedChange.pipe(filter(o => o), map(() => { }));
	}

	/** Event emitted when the select has been closed. */
	@Output('closed')
	get _closedStream(): Observable<void> {
		return this.openedChange.pipe(filter(o => !o), map(() => { }));
	}

	/** Event emitted when the selected value has been changed by the user. */
	@Output() selectionChange: EventEmitter<SelectChangeEvent> = new EventEmitter<SelectChangeEvent>();

	/**
	 * Event that emits whenever the raw value of the select changes. This is here primarily
	 * to facilitate the two-way binding for the `value` input.
	 * @docs-private
	 */
	@Output() valueChange = new EventEmitter<any>();

	constructor (
		private _viewportService: ViewportService,
		private _changeDetectorRef: ChangeDetectorRef,
		private _ngZone: NgZone,
		private _defaultErrorStateMatcherService: ErrorStateMatcherService,
		renderer: Renderer2,
		elementRef: ElementRef,
		@Optional() private _parentForm: NgForm,
		@Optional() private _parentFormGroup: FormGroupDirective,
		@Optional() private _parentFormField: FormFieldComponent,
		@Self() @Optional() public ngControl: NgControl,
		@Attribute('tabindex') tabIndex: string,
		@Inject(SELECT_SCROLL_STRATEGY) private _scrollStrategyFactory) {

		super(renderer, elementRef);

		if (this.ngControl) {
			this.ngControl.valueAccessor = this;
		}

		this.tabIndex = parseInt(tabIndex) || 0;

		// Force setter to be called in case id was not specified.
		this.id = this.id;
	}

	ngOnInit() {
		this._selectionContext = new SelectionContext<OptionComponent>(this.multiple, undefined, false);
		this.stateChanges.next();
	}

	ngAfterContentInit() {
		this._initKeyManager();

		this.options.changes.pipe(startWith(null), takeUntil(this._destroy)).subscribe(() => {
			this._resetOptions();
			this._initializeSelection();
		});
	}

	ngDoCheck() {
		if (this.ngControl) {
			this._updateErrorState();
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		// Updating the disabled state is handled by `mixinDisabled`, but we need to additionally let
		// the parent form field know to run change detection when the disabled state changes.
		if (changes.disabled) {
			this.stateChanges.next();
		}
	}

	ngOnDestroy() {
		this._destroy.next();
		this._destroy.complete();
	}

	/** Toggles the overlay panel open or closed. */
	toggle(): void {
		this.panelOpen ? this.close() : this.open();
	}

	/** Opens the overlay panel. */
	open(): void {
		if (this.disabled || !this.options || !this.options.length) {
			return;
		}

		this._triggerRect = this.trigger.nativeElement.getBoundingClientRect();
		// Note: The computed font-size will be a string pixel value (e.g. "16px").
		// `parseInt` ignores the trailing 'px' and converts this to a number.
		this._triggerFontSize = parseInt(getComputedStyle(this.trigger.nativeElement)['font-size']);

		this._panelOpen = true;
		this._calculateOverlayPosition();
		this._highlightCorrectOption();
		this._changeDetectorRef.markForCheck();

		// Set the font size on the panel element once it exists.
		this._ngZone.onStable.asObservable().pipe(first()).subscribe(() => {
			if (this._triggerFontSize && this.overlayDir.overlayRef &&
				this.overlayDir.overlayRef.overlayElement) {
				this.overlayDir.overlayRef.overlayElement.style.fontSize = `${this._triggerFontSize}px`;
			}
		});
	}

	/** Closes the overlay panel and focuses the host element. */
	close(): void {
		if (this._panelOpen) {
			this._panelOpen = false;
			this._changeDetectorRef.markForCheck();
			this.focus();
		}
	}

	/**
	 * Sets the select's value. Part of the ControlValueAccessor interface
	 * required to integrate with Angular's core forms API.
	 *
	 * @param value New value to be written to the model.
	 */
	writeValue(value: any): void {
		if (this.options) {
			this._setSelectionByValue(value);
		}
	}

	/**
	 * Saves a callback function to be invoked when the select's value
	 * changes from user input. Part of the ControlValueAccessor interface
	 * required to integrate with Angular's core forms API.
	 *
	 * @param fn Callback to be triggered when the value changes.
	 */
	registerOnChange(fn: (value: any) => void): void {
		this._onChange = fn;
	}

	/**
	 * Saves a callback function to be invoked when the select is blurred
	 * by the user. Part of the ControlValueAccessor interface required
	 * to integrate with Angular's core forms API.
	 *
	 * @param fn Callback to be triggered when the component has been touched.
	 */
	registerOnTouched(fn: () => {}): void {
		this._onTouched = fn;
	}

	/**
	 * Disables the select. Part of the ControlValueAccessor interface required
	 * to integrate with Angular's core forms API.
	 *
	 * @param isDisabled Sets whether the component is disabled.
	 */
	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
		this._changeDetectorRef.markForCheck();
		this.stateChanges.next();
	}

	/** Whether or not the overlay panel is open. */
	get panelOpen(): boolean {
		return this._panelOpen;
	}

	/** The currently selected option. */
	get selected(): OptionComponent | OptionComponent[] {
		return this.multiple ? this._selectionContext.selected : this._selectionContext.selected[0];
	}

	/** The value displayed in the trigger. */
	get triggerValue(): string {
		if (this.empty) {
			return '';
		}

		if (this._multiple) {
			const selectedOptions = this._selectionContext.selected.map(option => option.viewValue);

			// TODO: delimiter should be configurable for proper localization.
			return selectedOptions.join(', ');
		}

		return this._selectionContext.selected[0].viewValue;
	}

	/** Handles all keydown events on the select. */
	_handleKeydown(event: KeyboardEvent): void {
		if (!this.disabled) {
			this.panelOpen ? this._handleOpenKeydown(event) : this._handleClosedKeydown(event);
		}
	}

	/** Handles keyboard events while the select is closed. */
	private _handleClosedKeydown(event: KeyboardEvent): void {
		const keyCode = event.keyCode;
		const isArrowKey = keyCode === KeyCodes.DOWN_ARROW || keyCode === KeyCodes.UP_ARROW;
		const isOpenKey = keyCode === KeyCodes.ENTER || keyCode === KeyCodes.SPACE;

		if (isOpenKey || (this.multiple && isArrowKey)) {
			event.preventDefault(); // prevents the page from scrolling down when pressing space
			this.open();
		} else if (!this.multiple) {
			this._keyManager.onKeydown(event);
		}
	}

	/** Handles keyboard events when the selected is open. */
	private _handleOpenKeydown(event: KeyboardEvent): void {
		const keyCode = event.keyCode;

		if (keyCode === KeyCodes.HOME || keyCode === KeyCodes.END) {
			event.preventDefault();
			keyCode === KeyCodes.HOME ? this._keyManager.setFirstItemActive() :
				this._keyManager.setLastItemActive();
		} else if ((keyCode === KeyCodes.ENTER || keyCode === KeyCodes.SPACE) && this._keyManager.activeItem) {
			event.preventDefault();
			this._keyManager.activeItem._selectViaInteraction();
		} else {
			this._keyManager.onKeydown(event);
		}
	}

	/**
	 * When the panel element is finished transforming in (though not fading in), it
	 * emits an event and focuses an option if the panel is open.
	 */
	_onPanelDone(): void {
		if (this.panelOpen) {
			this._scrollTop = 0;
			this.openedChange.emit(true);
		} else {
			this.openedChange.emit(false);
			this._panelDoneAnimating = false;
			this.overlayDir.offsetX = 0;
			this._changeDetectorRef.markForCheck();
		}
	}

	/**
	 * When the panel content is done fading in, the _panelDoneAnimating property is
	 * set so the proper class can be added to the panel.
	 */
	_onFadeInDone(): void {
		this._panelDoneAnimating = this.panelOpen;
		this._changeDetectorRef.markForCheck();
	}

	_onFocus() {
		if (!this.disabled) {
			this.focused = true;
			this.stateChanges.next();
		}
	}

	/**
	 * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
	 * "blur" to the panel when it opens, causing a false positive.
	 */
	_onBlur() {
		if (!this.disabled && !this.panelOpen) {
			this.focused = false;
			this._onTouched();
			this._changeDetectorRef.markForCheck();
			this.stateChanges.next();
		}
	}

	/**
	 * Callback that is invoked when the overlay panel has been attached.
	 */
	_onAttached(): void {
		this.overlayDir.positionChange.pipe(first()).subscribe(() => {
			this._changeDetectorRef.detectChanges();
			this._calculateOverlayOffsetX();
			this.panel.nativeElement.scrollTop = this._scrollTop;
		});
	}

	/** Returns the theme to be used on the panel. */
	_getPanelTheme(): string {
		return this._parentFormField ? `app-${this._parentFormField.color}` : '';
	}

	/** Whether the select has a value. */
	get empty(): boolean {
		return !this._selectionContext || this._selectionContext.isEmpty();
	}

	/** Whether the select is in an error state. */
	errorState: boolean;

	private _initializeSelection(): void {
		// Defer setting the value in order to avoid the "Expression
		// has changed after it was checked" errors from Angular.
		Promise.resolve().then(() => {
			this._setSelectionByValue(this.ngControl ? this.ngControl.value : this._value);
		});
	}

	/**
	 * Sets the selected option based on a value. If no option can be
	 * found with the designated value, the select trigger is cleared.
	 */
	private _setSelectionByValue(value: any | any[], isUserInput = false): void {
		if (this.multiple && value) {
			if (!Array.isArray(value)) {
				throw SelectErrors.getNonArrayValueError();
			}

			this._clearSelection();
			value.forEach((currentValue: any) => this._selectValue(currentValue, isUserInput));
			this._sortValues();
		} else {
			this._clearSelection();

			const correspondingOption = this._selectValue(value, isUserInput);

			// Shift focus to the active item. Note that we shouldn't do this in multiple
			// mode, because we don't know what option the user interacted with last.
			if (correspondingOption) {
				this._keyManager.setActiveItem(this.options.toArray().indexOf(correspondingOption));
			}
		}

		this._changeDetectorRef.markForCheck();
	}

	/**
	 * Finds and selects and option based on its value.
	 * @returns Option that has the corresponding value.
	 */
	private _selectValue(value: any, isUserInput = false): OptionComponent | undefined {
		const correspondingOption = this.options.find((option: OptionComponent) => {
			try {
				// Treat null as a special reset value.
				return option.value != null && this._compareWith(option.value, value);
			} catch (error) {
				if (isDevMode()) {
					// Notify developers of errors in their comparator.
					console.warn(error);
				}
				return false;
			}
		});

		if (correspondingOption) {
			isUserInput ? correspondingOption._selectViaInteraction() : correspondingOption.select();
			this._selectionContext.select(correspondingOption);
			this.stateChanges.next();
		}

		return correspondingOption;
	}


	/**
	 * Clears the select trigger and deselects every option in the list.
	 * @param skip Option that should not be deselected.
	 */
	private _clearSelection(skip?: OptionComponent): void {
		this._selectionContext.clear();
		this.options.forEach(option => {
			if (option !== skip) {
				option.deselect();
			}
		});
		this.stateChanges.next();
	}

	/** Sets up a key manager to listen to keyboard events on the overlay panel. */
	private _initKeyManager() {
		this._keyManager = new ActiveDescendantKeyManager<OptionComponent>(this.options).withTypeAhead();
		this._keyManager.tabOut.pipe(takeUntil(this._destroy)).subscribe(() => this.close());

		this._keyManager.change.pipe(takeUntil(this._destroy)).subscribe(() => {
			if (this._panelOpen && this.panel) {
				this._scrollActiveOptionIntoView();
			} else if (!this._panelOpen && !this.multiple && this._keyManager.activeItem) {
				this._keyManager.activeItem._selectViaInteraction();
			}
		});
	}

	/** Drops current option subscriptions and IDs and resets from scratch. */
	private _resetOptions(): void {
		this.optionSelectionChanges.pipe(
			takeUntil(merge(this._destroy, this.options.changes)),
			filter(event => event.isUserInput)
		).subscribe(event => {
			this._onSelect(event.source);

			if (!this.multiple) {
				this.close();
			}
		});

		this._setOptionIds();
	}

	/** Invoked when an option is clicked. */
	private _onSelect(option: OptionComponent): void {
		const wasSelected = this._selectionContext.isSelected(option);

		// TODO(crisbeto): handle blank/null options inside multi-select.
		if (this.multiple) {
			this._selectionContext.toggle(option);
			this.stateChanges.next();
			wasSelected ? option.deselect() : option.select();
			this._sortValues();
		} else {
			this._clearSelection(option.value == null ? undefined : option);

			if (option.value == null) {
				this._propagateChanges(option.value);
			} else {
				this._selectionContext.select(option);
				this.stateChanges.next();
			}
		}

		if (wasSelected !== this._selectionContext.isSelected(option)) {
			this._propagateChanges();
		}
	}

	/**
	 * Sorts the model values, ensuring that they keep the same
	 * order that they have in the panel.
	 */
	private _sortValues(): void {
		if (this._multiple) {
			this._selectionContext.clear();

			this.options.forEach(option => {
				if (option.selected) {
					this._selectionContext.select(option);
				}
			});
			this.stateChanges.next();
		}
	}

	/** Emits change event to set the model value. */
	private _propagateChanges(fallbackValue?: any): void {
		let valueToEmit: any = null;

		if (this.multiple) {
			valueToEmit = (this.selected as OptionComponent[]).map(option => option.value);
		} else {
			valueToEmit = this.selected ? (this.selected as OptionComponent).value : fallbackValue;
		}

		this._value = valueToEmit;
		this._onChange(valueToEmit);
		this.selectionChange.emit(new SelectChangeEvent(this, valueToEmit));
		this.valueChange.emit(valueToEmit);
		this._changeDetectorRef.markForCheck();
	}

	/** Records option IDs to pass to the aria-owns property. */
	private _setOptionIds() {
		this._optionIds = this.options.map(option => option.id).join(' ');
	}

	/**
	 * Highlights the selected item. If no option is selected, it will highlight
	 * the first item instead.
	 */
	private _highlightCorrectOption(): void {
		if (this._keyManager) {
			if (this.empty) {
				this._keyManager.setFirstItemActive();
			} else {
				this._keyManager.setActiveItem(this._getOptionIndex(this._selectionContext.selected[0])!);
			}
		}
	}

	/** Scrolls the active option into view. */
	private _scrollActiveOptionIntoView(): void {
		const itemHeight = this._getItemHeight();
		const activeOptionIndex = this._keyManager.activeItemIndex || 0;
		const labelCount = OptionComponent.countGroupLabelsBeforeOption(activeOptionIndex,
			this.options, this.optionGroups);
		const scrollOffset = (activeOptionIndex + labelCount) * itemHeight;
		const panelTop = this.panel.nativeElement.scrollTop;

		if (scrollOffset < panelTop) {
			this.panel.nativeElement.scrollTop = scrollOffset;
		} else if (scrollOffset + itemHeight > panelTop + SELECT_PANEL_MAX_HEIGHT) {
			this.panel.nativeElement.scrollTop =
				Math.max(0, scrollOffset - SELECT_PANEL_MAX_HEIGHT + itemHeight);
		}
	}

	/** Focuses the select element. */
	focus(): void {
		this._elementRef.nativeElement.focus();
	}

	/** Gets the index of the provided option in the option list. */
	private _getOptionIndex(option: OptionComponent): number | undefined {
		return this.options.reduce((result: number, current: OptionComponent, index: number) => {
			return result === undefined ? (option === current ? index : undefined) : result;
		}, undefined);
	}

	/** Calculates the scroll position and x- and y-offsets of the overlay panel. */
	private _calculateOverlayPosition(): void {
		const itemHeight = this._getItemHeight();
		const items = this._getItemCount();
		const panelHeight = Math.min(items * itemHeight, SELECT_PANEL_MAX_HEIGHT);
		const scrollContainerHeight = items * itemHeight;

		// The farthest the panel can be scrolled before it hits the bottom
		const maxScroll = scrollContainerHeight - panelHeight;

		// If no value is selected we open the popup to the first item.
		let selectedOptionOffset =
			this.empty ? 0 : this._getOptionIndex(this._selectionContext.selected[0])!;

		selectedOptionOffset += OptionComponent.countGroupLabelsBeforeOption(selectedOptionOffset,
			this.options, this.optionGroups);

		// We must maintain a scroll buffer so the selected option will be scrolled to the
		// center of the overlay panel rather than the top.
		const scrollBuffer = panelHeight / 2;
		this._scrollTop = this._calculateOverlayScroll(selectedOptionOffset, scrollBuffer, maxScroll);
		this._offsetY = this._calculateOverlayOffsetY(selectedOptionOffset, scrollBuffer, maxScroll);

		this._checkOverlayWithinViewport(maxScroll);
	}

	/**
	 * Calculates the scroll position of the select's overlay panel.
	 *
	 * Attempts to center the selected option in the panel. If the option is
	 * too high or too low in the panel to be scrolled to the center, it clamps the
	 * scroll position to the min or max scroll positions respectively.
	 */
	_calculateOverlayScroll(selectedIndex: number, scrollBuffer: number,
		maxScroll: number): number {
		const itemHeight = this._getItemHeight();
		const optionOffsetFromScrollTop = itemHeight * selectedIndex;
		const halfOptionHeight = itemHeight / 2;

		// Starts at the optionOffsetFromScrollTop, which scrolls the option to the top of the
		// scroll container, then subtracts the scroll buffer to scroll the option down to
		// the center of the overlay panel. Half the option height must be re-added to the
		// scrollTop so the option is centered based on its middle, not its top edge.
		const optimalScrollPosition = optionOffsetFromScrollTop - scrollBuffer + halfOptionHeight;
		return Math.min(Math.max(0, optimalScrollPosition), maxScroll);
	}

	/** Returns the aria-label of the select component. */
	get _ariaLabel(): string | null {
		// If an ariaLabelledby value has been set, the select should not overwrite the
		// `aria-labelledby` value by setting the ariaLabel to the placeholder.
		return this.ariaLabelledby ? null : this.ariaLabel || this.placeholder;
	}

	/** Determines the `aria-activedescendant` to be set on the host. */
	_getAriaActiveDescendant(): string | null {
		if (this.panelOpen && this._keyManager && this._keyManager.activeItem) {
			return this._keyManager.activeItem.id;
		}

		return null;
	}

	/**
	 * Sets the x-offset of the overlay panel in relation to the trigger's top start corner.
	 * This must be adjusted to align the selected option text over the trigger text when
	 * the panel opens. Note that the offset can't be calculated until the panel has been 
	 * attached, because we need to know the content width in order to constrain the panel
	 * within the viewport.
	 */
	private _calculateOverlayOffsetX(): void {
		const overlayRect = this.overlayDir.overlayRef.overlayElement.getBoundingClientRect();
		const viewportSize = this._viewportService.getViewportSize();
		const paddingWidth = this.multiple ? SELECT_MULTIPLE_PANEL_PADDING_X + SELECT_PANEL_PADDING_X :
			SELECT_PANEL_PADDING_X * 2;
		let offsetX: number;

		// Adjust the offset, depending on the option padding.
		if (this.multiple) {
			offsetX = SELECT_MULTIPLE_PANEL_PADDING_X;
		} else {
			let selected = this._selectionContext.selected[0] || this.options.first;
			offsetX = selected && selected.group ? SELECT_PANEL_INDENT_PADDING_X : SELECT_PANEL_PADDING_X;
		}

		offsetX *= -1;

		// Determine how much the select overflows on each side.
		const leftOverflow = 0 - (overlayRect.left + offsetX);
		const rightOverflow = overlayRect.right + offsetX - viewportSize.width + paddingWidth;

		// If the element overflows on either side, reduce the offset to allow it to fit.
		if (leftOverflow > 0) {
			offsetX += leftOverflow + SELECT_PANEL_VIEWPORT_PADDING;
		} else if (rightOverflow > 0) {
			offsetX -= rightOverflow + SELECT_PANEL_VIEWPORT_PADDING;
		}

		// Set the offset directly in order to avoid having to go through change detection and
		// potentially triggering "changed after it was checked" errors.
		this.overlayDir.offsetX = offsetX;
		this.overlayDir.overlayRef.updatePosition();
	}

	/**
	 * Calculates the y-offset of the select's overlay panel in relation to the
	 * top start corner of the trigger. It has to be adjusted in order for the
	 * selected option to be aligned over the trigger when the panel opens.
	 */
	private _calculateOverlayOffsetY(selectedIndex: number, scrollBuffer: number,
		maxScroll: number): number {
		const itemHeight = this._getItemHeight();
		const optionHeightAdjustment = (itemHeight - this._triggerRect.height) / 2;
		const maxOptionsDisplayed = Math.floor(SELECT_PANEL_MAX_HEIGHT / itemHeight);
		let optionOffsetFromPanelTop: number;

		if (this._scrollTop === 0) {
			optionOffsetFromPanelTop = selectedIndex * itemHeight;
		} else if (this._scrollTop === maxScroll) {
			const firstDisplayedIndex = this._getItemCount() - maxOptionsDisplayed;
			const selectedDisplayIndex = selectedIndex - firstDisplayedIndex;

			// The first item is partially out of the viewport. Therefore we need to calculate what
			// portion of it is shown in the viewport and account for it in our offset.
			let partialItemHeight =
				itemHeight - (this._getItemCount() * itemHeight - SELECT_PANEL_MAX_HEIGHT) % itemHeight;

			// Because the panel height is longer than the height of the options alone,
			// there is always extra padding at the top or bottom of the panel. When
			// scrolled to the very bottom, this padding is at the top of the panel and
			// must be added to the offset.
			optionOffsetFromPanelTop = selectedDisplayIndex * itemHeight + partialItemHeight;
		} else {
			// If the option was scrolled to the middle of the panel using a scroll buffer,
			// its offset will be the scroll buffer minus the half height that was added to
			// center it.
			optionOffsetFromPanelTop = scrollBuffer - itemHeight / 2;
		}

		// The final offset is the option's offset from the top, adjusted for the height
		// difference, multiplied by -1 to ensure that the overlay moves in the correct
		// direction up the page.
		return optionOffsetFromPanelTop * (-1) - optionHeightAdjustment - SELECT_PANEL_PADDING_Y;
	}

	/**
	 * Checks that the attempted overlay position will fit within the viewport.
	 * If it will not fit, tries to adjust the scroll position and the associated
	 * y-offset so the panel can open fully on-screen. If it still won't fit,
	 * sets the offset back to 0 to allow the fallback position to take over.
	 */
	private _checkOverlayWithinViewport(maxScroll: number): void {
		const itemHeight = this._getItemHeight();
		const viewportSize = this._viewportService.getViewportSize();

		const topSpaceAvailable = this._triggerRect.top - SELECT_PANEL_VIEWPORT_PADDING;
		const bottomSpaceAvailable =
			viewportSize.height - this._triggerRect.bottom - SELECT_PANEL_VIEWPORT_PADDING;

		const panelHeightTop = Math.abs(this._offsetY);
		const totalPanelHeight =
			Math.min(this._getItemCount() * itemHeight, SELECT_PANEL_MAX_HEIGHT);
		const panelHeightBottom = totalPanelHeight - panelHeightTop - this._triggerRect.height;

		if (panelHeightBottom > bottomSpaceAvailable) {
			this._adjustPanelUp(panelHeightBottom, bottomSpaceAvailable);
		} else if (panelHeightTop > topSpaceAvailable) {
			this._adjustPanelDown(panelHeightTop, topSpaceAvailable, maxScroll);
		} else {
			this._transformOrigin = this._getOriginBasedOnOption();
		}
	}

	/** Adjusts the overlay panel up to fit in the viewport. */
	private _adjustPanelUp(panelHeightBottom: number, bottomSpaceAvailable: number) {
		// Browsers ignore fractional scroll offsets, so we need to round.
		const distanceBelowViewport = Math.round(panelHeightBottom - bottomSpaceAvailable);

		// Scrolls the panel up by the distance it was extending past the boundary, then
		// adjusts the offset by that amount to move the panel up into the viewport.
		this._scrollTop -= distanceBelowViewport;
		this._offsetY -= distanceBelowViewport;
		this._transformOrigin = this._getOriginBasedOnOption();

		// If the panel is scrolled to the very top, it won't be able to fit the panel
		// by scrolling, so set the offset to 0 to allow the fallback position to take
		// effect.
		if (this._scrollTop <= 0) {
			this._scrollTop = 0;
			this._offsetY = 0;
			this._transformOrigin = `50% bottom 0px`;
		}
	}

	/** Adjusts the overlay panel down to fit in the viewport. */
	private _adjustPanelDown(panelHeightTop: number, topSpaceAvailable: number,
		maxScroll: number) {
		// Browsers ignore fractional scroll offsets, so we need to round.
		const distanceAboveViewport = Math.round(panelHeightTop - topSpaceAvailable);

		// Scrolls the panel down by the distance it was extending past the boundary, then
		// adjusts the offset by that amount to move the panel down into the viewport.
		this._scrollTop += distanceAboveViewport;
		this._offsetY += distanceAboveViewport;
		this._transformOrigin = this._getOriginBasedOnOption();

		// If the panel is scrolled to the very bottom, it won't be able to fit the
		// panel by scrolling, so set the offset to 0 to allow the fallback position
		// to take effect.
		if (this._scrollTop >= maxScroll) {
			this._scrollTop = maxScroll;
			this._offsetY = 0;
			this._transformOrigin = `50% top 0px`;
			return;
		}
	}

	/** Sets the transform origin point based on the selected option. */
	private _getOriginBasedOnOption(): string {
		const itemHeight = this._getItemHeight();
		const optionHeightAdjustment = (itemHeight - this._triggerRect.height) / 2;
		const originY = Math.abs(this._offsetY) - optionHeightAdjustment + itemHeight / 2;
		return `50% ${originY}px 0px`;
	}

	/** Calculates the amount of items in the select. This includes options and group labels. */
	private _getItemCount(): number {
		return this.options.length + this.optionGroups.length;
	}

	/** Calculates the height of the select's options. */
	private _getItemHeight(): number {
		//return this._triggerFontSize * SELECT_ITEM_HEIGHT_EM;
		return SELECT_ITEM_HEIGHT_PX;
	}

	/** Updates the select's error state. Only relevant when used with @angular/forms. */
	private _updateErrorState() {
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

	// Implemented as part of BaseFormFieldControl.
	setDescribedByIds(ids: string[]) {
		this._ariaDescribedby = ids.join(' ');
	}

	// Implemented as part of BaseFormFieldControl.
	onContainerClick() {
		this.focus();
		this.open();
	}

	// Implemented as part of BaseFormFieldControl.
	get shouldPlaceholderFloat(): boolean {
		return this._panelOpen || !this.empty;
	}
}
