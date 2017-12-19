import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Optional,
	Output,
	QueryList,
	ViewEncapsulation,
	InjectionToken,
	Inject,
} from '@angular/core';
import { CoercionHelper, KeyCodes } from '@app/cdk';
import { OptgroupComponent } from './optgroup.component';
import { OptionParentComponent } from './option-parent-component';
import { OPTION_PARENT_COMPONENT } from './option-parent-component.token';



/**
 * Option IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueIdCounter = 0;



/** Event object emitted by OptionComponent when selected or deselected. */
export class OptionSelectionChangeEvent {
	constructor (public source: OptionComponent, public isUserInput = false) { }
}



/**
 * Single option inside of a `<app-select>` element.
 */
@Component({
	selector: 'app-option',
	exportAs: 'appOption',
	templateUrl: './option.component.html',
	styleUrls: ['./option.component.scss'],
	host: {
		'role': 'option',
		'[attr.tabindex]': '_getTabIndex()',
		'[class.app-selected]': 'selected',
		'[class.app-option-multiple]': 'multiple',
		'[class.app-active]': 'active',
		'[id]': 'id',
		'[attr.aria-selected]': 'selected.toString()',
		'[attr.aria-disabled]': 'disabled.toString()',
		'[class.app-option-disabled]': 'disabled',
		'(click)': '_selectViaInteraction()',
		'(keydown)': '_handleKeydown($event)',
		'class': 'app-option'
	},
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionComponent {
	private _selected = false;
	private _active = false;
	private _disabled = false;
	private _id = `app-option-${_uniqueIdCounter++}`;

	/** Whether the wrapping component is in multiple selection mode. */
	get multiple() { return this._parent && this._parent.multiple; }

	/** The unique ID of the option. */
	get id(): string { return this._id; }

	/** Whether or not the option is currently selected. */
	get selected(): boolean { return this._selected; }

	/** The form value of the option. */
	@Input() value: any;

	/** Whether the option is disabled. */
	@Input()
	get disabled() { return (this.group && this.group.disabled) || this._disabled; }
	set disabled(value: any) { this._disabled = CoercionHelper.coerceBoolean(value); }

	/** Event emitted when the option is selected or deselected. */
	@Output() onSelectionChange = new EventEmitter<OptionSelectionChangeEvent>();

	constructor (
		private _element: ElementRef,
		private _changeDetectorRef: ChangeDetectorRef,
		@Optional() @Inject(OPTION_PARENT_COMPONENT) private _parent: OptionParentComponent,
		@Optional() readonly group: OptgroupComponent) { }

	/**
	 * Whether or not the option is currently active and ready to be selected.
	 * An active option displays styles as if it is focused, but the
	 * focus is actually retained somewhere else. This comes in handy
	 * for components like autocomplete where focus must remain on the input.
	 */
	get active(): boolean {
		return this._active;
	}

	/**
	 * The displayed value of the option. It is necessary to show the selected option in the
	 * select's trigger.
	 */
	get viewValue(): string {
		// TODO(kara): Add input property alternative for node envs.
		return (this._getHostElement().textContent || '').trim();
	}

	/** Selects the option. */
	select(): void {
		this._selected = true;
		this._changeDetectorRef.markForCheck();
		this._emitSelectionChangeEvent();
	}

	/** Deselects the option. */
	deselect(): void {
		this._selected = false;
		this._changeDetectorRef.markForCheck();
		this._emitSelectionChangeEvent();
	}

	/** Sets focus onto this option. */
	focus(): void {
		const element = this._getHostElement();

		if (typeof element.focus === 'function') {
			element.focus();
		}
	}

	/**
	 * This method sets display styles on the option to make it appear
	 * active. This is used by the ActiveDescendantKeyManager so key
	 * events will display the proper options as active on arrow key events.
	 */
	setActiveStyles(): void {
		if (!this._active) {
			this._active = true;
			this._changeDetectorRef.markForCheck();
		}
	}

	/**
	 * This method removes display styles on the option that made it appear
	 * active. This is used by the ActiveDescendantKeyManager so key
	 * events will display the proper options as active on arrow key events.
	 */
	setInactiveStyles(): void {
		if (this._active) {
			this._active = false;
			this._changeDetectorRef.markForCheck();
		}
	}

	/** Gets the label to be used when determining whether the option should be focused. */
	getLabel(): string {
		return this.viewValue;
	}

	/** Ensures the option is selected when activated from the keyboard. */
	_handleKeydown(event: KeyboardEvent): void {
		if (event.keyCode === KeyCodes.ENTER || event.keyCode === KeyCodes.SPACE) {
			this._selectViaInteraction();

			// Prevent the page from scrolling down and form submits.
			event.preventDefault();
		}
	}

	/**
	 * Selects the option while indicating the selection came from the user. Used to
	 * determine if the select's view -> model callback should be invoked.
	 */
	_selectViaInteraction(): void {
		if (!this.disabled) {
			this._selected = this.multiple ? !this._selected : true;
			this._changeDetectorRef.markForCheck();
			this._emitSelectionChangeEvent(true);
		}
	}

	/** Returns the correct tabindex for the option depending on disabled state. */
	_getTabIndex(): string {
		return this.disabled ? '-1' : '0';
	}

	/** Gets the host DOM element. */
	_getHostElement(): HTMLElement {
		return this._element.nativeElement;
	}

	/** Emits the selection change event. */
	private _emitSelectionChangeEvent(isUserInput = false): void {
		this.onSelectionChange.emit(new OptionSelectionChangeEvent(this, isUserInput));
	}

	/**
	 * Counts the amount of option group labels that precede the specified option.
	 * @param optionIndex Index of the option at which to start counting.
	 * @param options Flat list of all of the options.
	 * @param optionGroups Flat list of all of the option groups.
	 */
	static countGroupLabelsBeforeOption(optionIndex: number, options: QueryList<OptionComponent>,
		optionGroups: QueryList<OptgroupComponent>): number {

		if (optionGroups.length) {
			let optionsArray = options.toArray();
			let groups = optionGroups.toArray();
			let groupCounter = 0;

			for (let i = 0; i < optionIndex + 1; i++) {
				if (optionsArray[i].group && optionsArray[i].group === groups[groupCounter]) {
					groupCounter++;
				}
			}

			return groupCounter;
		}

		return 0;
	}

}
