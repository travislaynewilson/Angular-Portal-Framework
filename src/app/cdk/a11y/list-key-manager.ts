import { QueryList } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { filter } from 'rxjs/operators/filter';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
import { KeyCodes } from '@app/cdk/keycodes';
import { ListKeyManagerOption } from './list-key-manager-option';



/**
 * This class manages keyboard events for selectable lists. If you pass it a query list
 * of items, it will set the active item correctly when arrow events occur.
 */
export class ListKeyManager<T extends ListKeyManagerOption> {
	private _activeItemIndex = -1;
	private _activeItem: T;
	private _wrap = false;
	private _letterKeyStream = new Subject<string>();
	private _typeaheadSubscription = Subscription.EMPTY;

	// Buffer for the letters that the user has pressed when the typeahead option is turned on.
	private _pressedLetters: string[] = [];

	constructor (private _items: QueryList<T>) { }

	/**
	 * Stream that emits any time the TAB key is pressed, so components can react
	 * when focus is shifted off of the list.
	 */
	tabOut: Subject<void> = new Subject<void>();

	/** Stream that emits whenever the active item of the list manager changes. */
	change = new Subject<number>();

	/**
	 * Turns on wrapping mode, which ensures that the active item will wrap to
	 * the other end of list when there are no more items in the given direction.
	 */
	withWrap(): this {
		this._wrap = true;
		return this;
	}

	/**
	 * Turns on typeahead mode which allows users to set the active item by typing.
	 * @param debounceInterval Time to wait after the last keystroke before setting the active item.
	 */
	withTypeAhead(debounceInterval: number = 200): this {
		if (this._items.length && this._items.some(item => typeof item.getLabel !== 'function')) {
			throw Error('ListKeyManager items in typeahead mode must implement the `getLabel` method.');
		}

		this._typeaheadSubscription.unsubscribe();

		// Debounce the presses of non-navigational keys, collect the ones that correspond to letters
		// and convert those letters back into a string. Afterwards find the first item that starts
		// with that string and select it.
		this._typeaheadSubscription = this._letterKeyStream.pipe(
			tap(keyCode => this._pressedLetters.push(keyCode)),
			debounceTime(debounceInterval),
			filter(() => this._pressedLetters.length > 0),
			map(() => this._pressedLetters.join(''))
		).subscribe(inputString => {
			const items = this._items.toArray();

			// Start at 1 because we want to start searching at the item immediately
			// following the current active item.
			for (let i = 1; i < items.length + 1; i++) {
				const index = (this._activeItemIndex + i) % items.length;
				const item = items[index];

				if (!item.disabled && item.getLabel!().toUpperCase().trim().indexOf(inputString) === 0) {
					this.setActiveItem(index);
					break;
				}
			}

			this._pressedLetters = [];
		});

		return this;
	}

	/**
	 * Sets the active item to the item at the index specified.
	 * @param index The index of the item to be set as active.
	 */
	setActiveItem(index: number): void {
		const previousIndex = this._activeItemIndex;

		this._activeItemIndex = index;
		this._activeItem = this._items.toArray()[index];

		if (this._activeItemIndex !== previousIndex) {
			this.change.next(index);
		}
	}

	/**
	 * Sets the active item depending on the key event passed in.
	 * @param event Keyboard event to be used for determining which element should be active.
	 */
	onKeydown(event: KeyboardEvent): void {
		switch (event.keyCode) {
			case KeyCodes.DOWN_ARROW: this.setNextItemActive(); break;
			case KeyCodes.UP_ARROW: this.setPreviousItemActive(); break;
			case KeyCodes.TAB: this.tabOut.next(); return;
			default:
				const keyCode = event.keyCode;

				// Attempt to use the `event.key` which also maps it to the user's keyboard language,
				// otherwise fall back to resolving alphanumeric characters via the keyCode.
				if (event.key && event.key.length === 1) {
					this._letterKeyStream.next(event.key.toLocaleUpperCase());
				} else if ((keyCode >= KeyCodes.A && keyCode <= KeyCodes.Z) || (keyCode >= KeyCodes.ZERO && keyCode <= KeyCodes.NINE)) {
					this._letterKeyStream.next(String.fromCharCode(keyCode));
				}

				// Note that we return here, in order to avoid preventing
				// the default action of non-navigational keys.
				return;
		}

		this._pressedLetters = [];
		event.preventDefault();
	}

	/** Index of the currently active item. */
	get activeItemIndex(): number | null {
		return this._activeItemIndex;
	}

	/** The active item. */
	get activeItem(): T | null {
		return this._activeItem;
	}

	/** Sets the active item to the first enabled item in the list. */
	setFirstItemActive(): void {
		this._setActiveItemByIndex(0, 1);
	}

	/** Sets the active item to the last enabled item in the list. */
	setLastItemActive(): void {
		this._setActiveItemByIndex(this._items.length - 1, -1);
	}

	/** Sets the active item to the next enabled item in the list. */
	setNextItemActive(): void {
		this._activeItemIndex < 0 ? this.setFirstItemActive() : this._setActiveItemByDelta(1);
	}

	/** Sets the active item to a previous enabled item in the list. */
	setPreviousItemActive(): void {
		this._activeItemIndex < 0 && this._wrap ? this.setLastItemActive()
			: this._setActiveItemByDelta(-1);
	}

	/**
	 * Allows setting of the activeItemIndex without any other effects.
	 * @param index The new activeItemIndex.
	 */
	updateActiveItemIndex(index: number) {
		this._activeItemIndex = index;
	}

	/**
	 * This method sets the active item, given a list of items and the delta between the
	 * currently active item and the new active item. It will calculate differently
	 * depending on whether wrap mode is turned on.
	 */
	private _setActiveItemByDelta(delta: number, items = this._items.toArray()): void {
		this._wrap ? this._setActiveInWrapMode(delta, items)
			: this._setActiveInDefaultMode(delta, items);
	}

	/**
	 * Sets the active item properly given "wrap" mode. In other words, it will continue to move
	 * down the list until it finds an item that is not disabled, and it will wrap if it
	 * encounters either end of the list.
	 */
	private _setActiveInWrapMode(delta: number, items: T[]): void {
		// when active item would leave menu, wrap to beginning or end
		this._activeItemIndex =
			(this._activeItemIndex + delta + items.length) % items.length;

		// skip all disabled menu items recursively until an enabled one is reached
		if (items[this._activeItemIndex].disabled) {
			this._setActiveInWrapMode(delta, items);
		} else {
			this.setActiveItem(this._activeItemIndex);
		}
	}

	/**
	 * Sets the active item properly given the default mode. In other words, it will
	 * continue to move down the list until it finds an item that is not disabled. If
	 * it encounters either end of the list, it will stop and not wrap.
	 */
	private _setActiveInDefaultMode(delta: number, items: T[]): void {
		this._setActiveItemByIndex(this._activeItemIndex + delta, delta, items);
	}

	/**
	 * Sets the active item to the first enabled item starting at the index specified. If the
	 * item is disabled, it will move in the fallbackDelta direction until it either
	 * finds an enabled item or encounters the end of the list.
	 */
	private _setActiveItemByIndex(index: number, fallbackDelta: number,
		items = this._items.toArray()): void {
		if (!items[index]) { return; }
		while (items[index].disabled) {
			index += fallbackDelta;
			if (!items[index]) { return; }
		}
		this.setActiveItem(index);
	}
}
