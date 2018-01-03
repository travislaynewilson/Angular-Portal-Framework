import {
	Component,
	ChangeDetectionStrategy,
	Directive,
	IterableDiffers,
	TemplateRef,
	ViewEncapsulation,
	ViewContainerRef
} from '@angular/core';
import { BaseColumnCollection } from './base-column-collection';
import { CellTemplateDirective } from './cell';



/**
 * The row template that can be used by the mat-table. Should not be used outside of the
 * material library.
 */
export const ROW_TEMPLATE = `<ng-container appCellOutlet></ng-container>`;



/** Context provided to the row cells */
export interface CellOutletRowContext<T> {

	/** Data for the row that this cell is located within. */
	$implicit: T;

	/** Index location of the row that this cell is located within. */
	index?: number;

	/** Length of the number of total rows. */
	count?: number;

	/** True if this cell is contained in the first row. */
	first?: boolean;

	/** True if this cell is contained in the last row. */
	last?: boolean;

	/** True if this cell is contained in a row with an even-numbered index. */
	even?: boolean;

	/** True if this cell is contained in a row with an odd-numbered index. */
	odd?: boolean;
}



/** Outlet for rendering cells inside of a row or header row. */
@Directive({
	selector: '[appCellOutlet]'
})
export class CellOutletDirective {

	/** The ordered list of cells to render within this outlet's view container */
	cells: CellTemplateDirective[];

	/** The data context to be provided to each cell */
	context: any;

	/**
	 * Static property containing the latest constructed instance of this class.
	 * Used by the table when each HeaderRow and Row component is created using
	 * createEmbeddedView. After one of these components are created, this property will provide
	 * a handle to provide that component's cells and context. After init, the CellOutletDirective will
	 * construct the cells with the provided context.
	 */
	static mostRecentCellOutlet: CellOutletDirective | null = null;

	constructor (public _viewContainer: ViewContainerRef) {
		CellOutletDirective.mostRecentCellOutlet = this;
	}
}



/** Header template container that contains the cell outlet. Adds the right class and role. */
@Component({
	selector: 'app-header-row',
	template: ROW_TEMPLATE,
	host: {
		'class': 'app-header-row',
		'role': 'row'
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class HeaderRowComponent { }



/**
 * Header row definition for the table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
@Directive({
	selector: '[appHeaderRowColumns]',
	inputs: ['columns: appHeaderRowColumns']
})
export class HeaderRowColumnsDirective extends BaseColumnCollection {
	constructor (template: TemplateRef<any>, _differs: IterableDiffers) {
		super(template, _differs);
	}
}



/** Header template container that contains the cell outlet. Adds the right class and role. */
@Component({
	selector: 'app-row',
	template: ROW_TEMPLATE,
	host: {
		'class': 'app-row',
		'role': 'row'
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class RowComponent { }



/**
 * Data row definition for the table.
 * Captures the header row's template and other row properties such as the columns to display and
 * a when predicate that describes when this row should be used.
 */
@Directive({
	selector: '[appRowColumns]',
	inputs: ['columns: appRowColumnsColumns', 'when: appRowColumnsWhen']
})
export class RowColumnsDirective<T> extends BaseColumnCollection {

	/**
	 * Function that should return true if this row template should be used for the provided index
	 * and row data. If left undefined, this row will be considered the default row template to use
	 * when no other when functions return true for the data.
	 * For every row, there must be at least one when function that passes or an undefined to default.
	 */
	when: (index: number, rowData: T) => boolean;

	// TODO: Add an input for providing a switch function to determine if this template should be used.
	constructor (template: TemplateRef<any>, _differs: IterableDiffers) {
		super(template, _differs);
	}
}


