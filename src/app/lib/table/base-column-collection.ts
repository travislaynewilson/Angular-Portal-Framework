import {
	IterableChanges,
	IterableDiffer,
	IterableDiffers,
	SimpleChanges,
	TemplateRef
} from "@angular/core";



export abstract class BaseColumnCollection {

	/** The columns to be displayed on this row. */
	columns: string[];

	/** Differ used to check if any changes were made to the columns. */
	protected _columnsDiffer: IterableDiffer<any>;

	constructor (public template: TemplateRef<any>,
		protected _differs: IterableDiffers) { }

	ngOnChanges(changes: SimpleChanges): void {
		// Create a new columns differ if one does not yet exist. Initialize it based on initial value
		// of the columns property or an empty array if none is provided.
		const columns = changes['columns'].currentValue || [];
		if (!this._columnsDiffer) {
			this._columnsDiffer = this._differs.find(columns).create();
			this._columnsDiffer.diff(columns);
		}
	}

	/**
	 * Returns the difference between the current columns and the columns from the last diff, or null
	 * if there is no difference.
	 */
	getColumnsDiff(): IterableChanges<any> | null {
		return this._columnsDiffer.diff(this.columns);
	}
}