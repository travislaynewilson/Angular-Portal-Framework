import { Directive, EventEmitter, Input, isDevMode, Output } from '@angular/core';
import { CoercionHelper } from '@app/cdk';
import { SortDirection } from './sort-direction';
import { SortErrors } from './sort-errors';
import { Sortable } from './sortable';
import { SortEvent } from './sort.event';



/** Container for Sortables to manage the sort state and provide default sort parameters. */
@Directive({
	selector: '[appSortable]',
	exportAs: 'appSortable'
})
export class SortableDirective {
	
	/** Collection of all registered sortables that this directive manages. */
	sortables = new Map<string, Sortable>();

	/** The id of the most recently sorted Sortable. */
	@Input('appSortActive') active: string;

	/**
	 * The direction to set when an Sortable is initially sorted.
	 * May be overriden by the Sortable's sort start.
	 */
	@Input('appSortStart') start: 'asc' | 'desc' = 'asc';

	/** The sort direction of the currently active Sortable. */
	@Input('appSortDirection')
	set direction(direction: SortDirection) {
		if (isDevMode() && direction && direction !== 'asc' && direction !== 'desc') {
			throw SortErrors.getInvalidDirectionError(direction);
		}
		this._direction = direction;
	}
	get direction(): SortDirection { return this._direction; }
	private _direction: SortDirection = '';

	/**
	 * Whether to disable the user from clearing the sort by finishing the sort direction cycle.
	 * May be overriden by the Sortable's disable clear input.
	 */
	@Input('appSortDisableClear')
	get disableClear() { return this._disableClear; }
	set disableClear(v: boolean) { this._disableClear = CoercionHelper.coerceBoolean(v); }
	private _disableClear: boolean;

	/** Event emitted when the user changes either the active sort or sort direction. */
	@Output('sort') readonly sortChange = new EventEmitter<SortEvent>();

	/**
	 * Register function to be used by the contained Sortables. Adds the Sortable to the
	 * collection of Sortables.
	 */
	register(sortable: Sortable) {
		if (!sortable.id) {
			throw SortErrors.getHeaderMissingIdError();
		}

		if (this.sortables.has(sortable.id)) {
			throw SortErrors.getDuplicateSortableIdError(sortable.id);
		}
		this.sortables.set(sortable.id, sortable);
	}

	/**
	 * Unregister function to be used by the contained Sortables. Removes the Sortable from the
	 * collection of contained Sortables.
	 */
	deregister(sortable: Sortable) {
		this.sortables.delete(sortable.id);
	}

	/** Sets the active sort id and determines the new sort direction. */
	sort(sortable: Sortable) {
		if (this.active != sortable.id) {
			this.active = sortable.id;
			this.direction = sortable.start ? sortable.start : this.start;
		} else {
			this.direction = this.getNextSortDirection(sortable);
		}

		this.sortChange.next({ active: this.active, direction: this.direction });
	}

	/** Returns the next sort direction of the active sortable, checking for potential overrides. */
	getNextSortDirection(sortable: Sortable): SortDirection {
		if (!sortable) { return ''; }

		// Get the sort direction cycle with the potential sortable overrides.
		const disableClear = sortable.disableClear != null ? sortable.disableClear : this.disableClear;
		let sortDirectionCycle = getSortDirectionCycle(sortable.start || this.start, disableClear);

		// Get and return the next direction in the cycle
		let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
		if (nextDirectionIndex >= sortDirectionCycle.length) { nextDirectionIndex = 0; }
		return sortDirectionCycle[nextDirectionIndex];
	}
}



/** Returns the sort direction cycle to use given the provided parameters of order and clear. */
function getSortDirectionCycle(start: 'asc' | 'desc', disableClear: boolean): SortDirection[] {
	let sortOrder: SortDirection[] = ['asc', 'desc'];
	if (start == 'desc') { sortOrder.reverse(); }
	if (!disableClear) { sortOrder.push(''); }

	return sortOrder;
}
