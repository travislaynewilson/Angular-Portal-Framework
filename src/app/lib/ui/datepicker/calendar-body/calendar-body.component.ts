import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';
import {CalendarCell} from '../calendar-cell';



/** An internal component used to display calendar data in a table. */
@Component({
	selector: '[appCalendarBody]',
	templateUrl: 'calendar-body.component.html',
	styleUrls: ['calendar-body.component.scss'],
	host: {
		'class': 'app-calendar-body',
	},
	exportAs: 'appCalendarBody',
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarBodyComponent {

	/** The label for the table. (e.g. "Jan 2017"). */
	@Input() label: string;

	/** The cells to display in the table. */
	@Input() rows: CalendarCell[][];

	/** The value in the table that corresponds to today. */
	@Input() todayValue: number;

	/** The value in the table that is currently selected. */
	@Input() selectedValue: number;

	/** The minimum number of free cells needed to fit the label in the first row. */
	@Input() labelMinRequiredCells: number;

	/** The number of columns in the table. */
	@Input() numCols = 7;

	/** Whether to allow selection of disabled cells. */
	@Input() allowDisabledSelection = false;

	/** The cell number of the active cell in the table. */
	@Input() activeCell = 0;

	/**
	 * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
	 * maintained even as the table resizes.
	 */
	@Input() cellAspectRatio = 1;

	/** Emits when a new value is selected. */
	@Output() selectedValueChange = new EventEmitter<number>();

	_cellClicked (cell: CalendarCell): void {
		if (!this.allowDisabledSelection && !cell.enabled) {
			return;
		}
		this.selectedValueChange.emit(cell.value);
	}

	/** The number of blank cells to put at the beginning for the first row. */
	get _firstRowOffset (): number {
		return this.rows && this.rows.length && this.rows[0].length ?
			this.numCols - this.rows[0].length : 0;
	}

	_isActiveCell (rowIndex: number, colIndex: number): boolean {
		let cellNumber = rowIndex * this.numCols + colIndex;

		// Account for the fact that the first row may not have as many cells.
		if (rowIndex) {
			cellNumber -= this._firstRowOffset;
		}

		return cellNumber == this.activeCell;
	}
}
