import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	Optional,
	ViewEncapsulation
} from '@angular/core';
import {
	trigger,
	state,
	style,
	animate,
	transition,
	keyframes,
} from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
import { merge } from 'rxjs/observable/merge';
import { AnimationCurves, AnimationDurations, CoercionHelper } from '@app/cdk';
import { ColumnTemplateDirective } from '@app/lib/table';
import { SortableDirective } from './sortable.directive';
import { SortErrors } from './sort-errors';
import { Sortable } from './sortable';
import { SortDirection } from './sort-direction';



const SORT_ANIMATION_TRANSITION =
	AnimationDurations.ENTERING + ' ' + AnimationCurves.STANDARD_CURVE;



/**
 * Applies sorting behavior (click to change sort) and styles to an element, including an
 * arrow to display the current sort direction.
 *
 * Must be provided with an id and contained within a parent SortableDirective directive.
 *
 * If used on header cells in a TableComponent, it will automatically default its id from its containing
 * column definition.
 */
@Component({
	selector: '[appSortHeader], app-sort-header',
	exportAs: 'appSortHeader',
	templateUrl: 'sort-header.component.html',
	styleUrls: ['sort-header.component.scss'],
	host: {
		'(click)': '_sortContext.sort(this)',
		'[class.app-sort-header-sorted]': '_isSorted()'
	},
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('indicator', [
			state('asc', style({ transform: 'translateY(0px)' })),
			// 10px is the height of the sort indicator, minus the width of the pointers
			state('desc', style({ transform: 'translateY(10px)' })),
			transition('asc <=> desc', animate(SORT_ANIMATION_TRANSITION))
		]),
		trigger('leftPointer', [
			state('asc', style({ transform: 'rotate(-45deg)' })),
			state('desc', style({ transform: 'rotate(45deg)' })),
			transition('asc <=> desc', animate(SORT_ANIMATION_TRANSITION))
		]),
		trigger('rightPointer', [
			state('asc', style({ transform: 'rotate(45deg)' })),
			state('desc', style({ transform: 'rotate(-45deg)' })),
			transition('asc <=> desc', animate(SORT_ANIMATION_TRANSITION))
		]),
		trigger('indicatorToggle', [
			transition('void => asc', animate(SORT_ANIMATION_TRANSITION, keyframes([
				style({ transform: 'translateY(25%)', opacity: 0 }),
				style({ transform: 'none', opacity: 1 })
			]))),
			transition('asc => void', animate(SORT_ANIMATION_TRANSITION, keyframes([
				style({ transform: 'none', opacity: 1 }),
				style({ transform: 'translateY(-25%)', opacity: 0 })
			]))),
			transition('void => desc', animate(SORT_ANIMATION_TRANSITION, keyframes([
				style({ transform: 'translateY(-25%)', opacity: 0 }),
				style({ transform: 'none', opacity: 1 })
			]))),
			transition('desc => void', animate(SORT_ANIMATION_TRANSITION, keyframes([
				style({ transform: 'none', opacity: 1 }),
				style({ transform: 'translateY(25%)', opacity: 0 })
			])))
		])
	]
})
export class SortHeaderComponent implements Sortable {

	private _rerenderSubscription: Subscription;

	/**
	 * ID of this sort header. If used within the context of a ColumnTemplateDirective, this will default to
	 * the column's name.
	 */
	@Input('appSortHeader') id: string;

	/** Sets the position of the arrow that displays when sorted. */
	@Input() arrowPosition: 'before' | 'after' = 'after';

	/** Overrides the sort start value of the containing SortableDirective for this Sortable. */
	@Input('start') start: 'asc' | 'desc';

	/** Overrides the disable clear value of the containing SortableDirective for this Sortable. */
	@Input()
	get disableClear(): boolean { return this._disableClear; }
	set disableClear(v) { this._disableClear = CoercionHelper.coerceBoolean(v); }
	private _disableClear: boolean;

	constructor (
		changeDetectorRef: ChangeDetectorRef,
		@Optional() public _sortContext: SortableDirective,
		@Optional() public _columnTemplate: ColumnTemplateDirective) {
		if (!_sortContext) {
			throw SortErrors.getHeaderNotContainedWithinSortError();
		}

		this._rerenderSubscription = merge(_sortContext.sortChange).subscribe(() => {
			changeDetectorRef.markForCheck();
		});
	}

	ngOnInit() {
		if (!this.id && this._columnTemplate) {
			this.id = this._columnTemplate.name;
		}

		this._sortContext.register(this);
	}

	ngOnDestroy() {
		this._sortContext.deregister(this);
		this._rerenderSubscription.unsubscribe();
	}

	/** ARIA label for the sorting button. */
	sortButtonLabel = (id: string) => {
		return `Change sorting for ${id}`;
	}

	/** A label to describe the current sort (visible only to screenreaders). */
	sortDescriptionLabel = (id: string, direction: SortDirection) => {
		return `Sorted by ${id} ${direction == 'asc' ? 'ascending' : 'descending'}`;
	}

	/** Whether this SortHeaderComponent is currently sorted in either ascending or descending order. */
	_isSorted() {
		return this._sortContext.active == this.id &&
			(this._sortContext.direction === 'asc' || this._sortContext.direction === 'desc');
	}
}
