import {
	Attribute,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ContentChildren,
	Directive,
	ElementRef,
	EmbeddedViewRef,
	Input,
	isDevMode,
	IterableChangeRecord,
	IterableDiffer,
	IterableDiffers,
	NgIterable,
	QueryList,
	Renderer2,
	TrackByFunction,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation,
} from '@angular/core';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { CollectionViewer, DataSource, CoercionHelper } from '@app/cdk';
import { CellTemplateDirective, ColumnTemplateDirective, HeaderCellTemplateDirective } from './cell';
import { CellOutletDirective, CellOutletRowContext, HeaderRowColumnsDirective, RowColumnsDirective } from './row';
import { TableErrors } from './table-errors';
import { RowPlaceholderDirective } from './row-placeholder.directive';
import { HeaderRowPlaceholderDirective } from './header-row-placeholder.directive';
import { RowViewContext } from './row-view-context';



/**
 * A data table that connects with a data source to retrieve data of type `T` and renders
 * a header row and data rows. Updates the rows when new data is provided by the data source.
 */
@Component({
	selector: 'app-table',
	exportAs: 'appTable',
	templateUrl: 'table.component.html',
	styleUrls: ['table.component.scss'],
	host: {
		'class': 'app-table'
	},
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<T> implements CollectionViewer {

	/** Subject that emits when the component has been destroyed. */
	private _onDestroy = new Subject<void>();

	/** Latest data provided by the data source through the connect interface. */
	private _data: NgIterable<T> = [];

	/** Subscription that listens for the data provided by the data source. */
	private _renderChangeSubscription: Subscription | null;

	/** Map of all the user's defined columns (header and data cell template) identified by name. */
	private _columnDefsByName = new Map<string, ColumnTemplateDirective>();

	/** Differ used to find the changes in the data provided by the data source. */
	private _dataDiffer: IterableDiffer<T>;

	/** Stores the row definition that does not have a when predicate. */
	private _defaultRowDef: RowColumnsDirective<T> | null;

	/**
	 * Tracking function that will be used to check the differences in data changes. Used similarly
	 * to `ngFor` `trackBy` function. Optimize row operations by identifying a row based on its data
	 * relative to the function to know if a row should be added/removed/moved.
	 * Accepts a function that takes two parameters, `index` and `item`.
	 */
	@Input()
	get trackBy(): TrackByFunction<T> { return this._trackByFn; }
	set trackBy(fn: TrackByFunction<T>) {
		if (isDevMode() &&
			fn != null && typeof fn !== 'function' &&
			<any>console && <any>console.warn) {
			console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}.`);
		}
		this._trackByFn = fn;
	}
	private _trackByFn: TrackByFunction<T>;

	/**
	 * Provides a stream containing the latest data array to render. Influenced by the table's
	 * stream of view window (what rows are currently on screen).
	 */
	@Input()
	get dataSource(): DataSource<T> { return this._dataSource; }
	set dataSource(dataSource: DataSource<T>) {
		if (this._dataSource !== dataSource) {
			this._switchDataSource(dataSource);
		}
	}
	private _dataSource: DataSource<T>;

	// TODO: Remove max value as the end index
	//   and instead calculate the view on init and scroll.
	/**
	 * Stream containing the latest information on what rows are being displayed on screen.
	 * Can be used by the data source to as a heuristic of what data should be provided.
	 */
	viewChange =
		new BehaviorSubject<{ start: number, end: number }>({ start: 0, end: Number.MAX_VALUE });

	// Placeholders within the table's template where the header and data rows will be inserted.
	@ViewChild(RowPlaceholderDirective) _rowPlaceholder: RowPlaceholderDirective;
	@ViewChild(HeaderRowPlaceholderDirective) _headerRowPlaceholder: HeaderRowPlaceholderDirective;

	/**
	 * The column definitions provided by the user that contain what the header and cells should
	 * render for each column.
	 */
	@ContentChildren(ColumnTemplateDirective) _columnDefs: QueryList<ColumnTemplateDirective>;

	/** Template definition used as the header container. */
	@ContentChild(HeaderRowColumnsDirective) _headerDef: HeaderRowColumnsDirective;

	/** Set of template definitions that used as the data row containers. */
	@ContentChildren(RowColumnsDirective) _rowDefs: QueryList<RowColumnsDirective<T>>;

	constructor (private readonly _differs: IterableDiffers,
		private readonly _changeDetectorRef: ChangeDetectorRef,
		elementRef: ElementRef,
		renderer: Renderer2,
		@Attribute('role') role: string) {
		if (!role) {
			renderer.setAttribute(elementRef.nativeElement, 'role', 'grid');
		}
	}

	ngOnInit() {
		// TODO: Setup a listener for scrolling, emit the calculated view to viewChange
		this._dataDiffer = this._differs.find([]).create(this._trackByFn);
	}

	ngAfterContentInit() {
		if (!this._headerDef && !this._rowDefs.length) {
			throw TableErrors.getMissingRowDefsError();
		}

		this._cacheColumnDefsByName();
		this._columnDefs.changes.subscribe(() => this._cacheColumnDefsByName());
		this._renderHeaderRow();
	}

	ngAfterContentChecked() {
		this._renderUpdatedColumns();

		const defaultRowDefs = this._rowDefs.filter(def => !def.when);
		if (defaultRowDefs.length > 1) { throw TableErrors.getMultipleDefaultRowDefsError(); }
		this._defaultRowDef = defaultRowDefs[0];

		if (this.dataSource && !this._renderChangeSubscription) {
			this._observeRenderChanges();
		}
	}

	ngOnDestroy() {
		this._rowPlaceholder.viewContainer.clear();
		this._headerRowPlaceholder.viewContainer.clear();
		this._onDestroy.next();
		this._onDestroy.complete();

		if (this.dataSource) {
			this.dataSource.disconnect(this);
		}
	}

	/** Update the map containing the content's column definitions. */
	private _cacheColumnDefsByName() {
		this._columnDefsByName.clear();
		this._columnDefs.forEach(columnDef => {
			if (this._columnDefsByName.has(columnDef.name)) {
				throw TableErrors.getDuplicateColumnNameError(columnDef.name);
			}
			this._columnDefsByName.set(columnDef.name, columnDef);
		});
	}

	/**
	 * Check if the header or rows have changed what columns they want to display. If there is a diff,
	 * then re-render that section.
	 */
	private _renderUpdatedColumns() {
		// Re-render the rows when the row definition columns change.
		this._rowDefs.forEach(def => {
			if (!!def.getColumnsDiff()) {
				// Reset the data to an empty array so that renderRowChanges will re-render all new rows.
				this._dataDiffer.diff([]);

				this._rowPlaceholder.viewContainer.clear();
				this._renderRowChanges();
			}
		});

		// Re-render the header row if there is a difference in its columns.
		if (this._headerDef.getColumnsDiff()) {
			this._headerRowPlaceholder.viewContainer.clear();
			this._renderHeaderRow();
		}
	}

	/**
	 * Switch to the provided data source by resetting the data and unsubscribing from the current
	 * render change subscription if one exists. If the data source is null, interpret this by
	 * clearing the row placeholder. Otherwise start listening for new data.
	 */
	private _switchDataSource(dataSource: DataSource<T>) {
		this._data = [];

		if (this.dataSource) {
			this.dataSource.disconnect(this);
		}

		// Stop listening for data from the previous data source.
		if (this._renderChangeSubscription) {
			this._renderChangeSubscription.unsubscribe();
			this._renderChangeSubscription = null;
		}

		// Remove the table's rows if there is now no data source
		if (!dataSource) {
			this._rowPlaceholder.viewContainer.clear();
		}

		this._dataSource = dataSource;
	}

	/** Set up a subscription for the data provided by the data source. */
	private _observeRenderChanges() {
		this._renderChangeSubscription = this.dataSource.connect(this).pipe(takeUntil(this._onDestroy))
			.subscribe(data => {
				this._data = data;
				this._renderRowChanges();
			});
	}

	/**
	 * Create the embedded view for the header template and place it in the header row view container.
	 */
	private _renderHeaderRow() {
		const cells = this._getHeaderCellTemplatesForRow(this._headerDef);
		if (!cells.length) { return; }

		// TODO(andrewseguin): add some code to enforce that exactly
		//   one CdkCellOutlet was instantiated as a result
		//   of `createEmbeddedView`.
		this._headerRowPlaceholder.viewContainer
			.createEmbeddedView(this._headerDef.template, { cells });

		cells.forEach(cell => {
			if (CellOutletDirective.mostRecentCellOutlet) {
				CellOutletDirective.mostRecentCellOutlet._viewContainer.createEmbeddedView(cell.template, {});
			}
		});

		this._changeDetectorRef.markForCheck();
	}

	/**
	 * Check for changes made in the data and render each change (row added/removed/moved) and update
	 * row contexts.
	 */
	private _renderRowChanges() {
		const changes = this._dataDiffer.diff(this._data);
		if (!changes) { return; }

		const viewContainer = this._rowPlaceholder.viewContainer;
		changes.forEachOperation(
			(record: IterableChangeRecord<T>, adjustedPreviousIndex: number, currentIndex: number) => {
				if (record.previousIndex == null) {
					this._insertRow(record.item, currentIndex);
				} else if (currentIndex == null) {
					viewContainer.remove(adjustedPreviousIndex);
				} else {
					const view = <RowViewContext<T>>viewContainer.get(adjustedPreviousIndex);
					viewContainer.move(view!, currentIndex);
				}
			});

		// Update the meta context of a row's context data (index, count, first, last, ...)
		this._updateRowIndexContext();

		// Update rows that did not get added/removed/moved but may have had their identity changed,
		// e.g. if trackBy matched data on some property but the actual data reference changed.
		changes.forEachIdentityChange((record: IterableChangeRecord<T>) => {
			const rowView = <RowViewContext<T>>viewContainer.get(record.currentIndex!);
			rowView.context.$implicit = record.item;
		});
	}

	/**
	 * Finds the matching row definition that should be used for this row data. If there is only
	 * one row definition, it is returned. Otherwise, find the row definition that has a when
	 * predicate that returns true with the data. If none return true, return the default row
	 * definition.
	 */
	_getRowDef(data: T, i: number): RowColumnsDirective<T> {
		if (this._rowDefs.length == 1) { return this._rowDefs.first; }

		let rowDef = this._rowDefs.find(def => def.when && def.when(i, data)) || this._defaultRowDef;
		if (!rowDef) { throw TableErrors.getMissingMatchingRowDefError(); }

		return rowDef;
	}

	/**
	 * Create the embedded view for the data row template and place it in the correct index location
	 * within the data row view container.
	 */
	private _insertRow(rowData: T, index: number) {
		const row = this._getRowDef(rowData, index);

		// Row context that will be provided to both the created embedded row view and its cells.
		const context: CellOutletRowContext<T> = { $implicit: rowData };

		// TODO(andrewseguin): add some code to enforce that exactly one
		//   CdkCellOutlet was instantiated as a result  of `createEmbeddedView`.
		this._rowPlaceholder.viewContainer.createEmbeddedView(row.template, context, index);

		this._getCellTemplatesForRow(row).forEach(cell => {
			if (CellOutletDirective.mostRecentCellOutlet) {
				CellOutletDirective.mostRecentCellOutlet._viewContainer
					.createEmbeddedView(cell.template, context);
			}
		});

		this._changeDetectorRef.markForCheck();
	}

	/**
	 * Updates the index-related context for each row to reflect any changes in the index of the rows,
	 * e.g. first/last/even/odd.
	 */
	private _updateRowIndexContext() {
		const viewContainer = this._rowPlaceholder.viewContainer;
		for (let index = 0, count = viewContainer.length; index < count; index++) {
			const viewRef = viewContainer.get(index) as RowViewContext<T>;
			viewRef.context.index = index;
			viewRef.context.count = count;
			viewRef.context.first = index === 0;
			viewRef.context.last = index === count - 1;
			viewRef.context.even = index % 2 === 0;
			viewRef.context.odd = !viewRef.context.even;
		}
	}

	/**
	 * Returns the cell template definitions to insert into the header
	 * as defined by its list of columns to display.
	 */
	private _getHeaderCellTemplatesForRow(headerDef: HeaderRowColumnsDirective): HeaderCellTemplateDirective[] {
		if (!headerDef.columns) { return []; }
		return headerDef.columns.map(columnId => {
			const column = this._columnDefsByName.get(columnId);

			if (!column) {
				throw TableErrors.getUnknownColumnError(columnId);
			}

			return column.headerCell;
		});
	}

	/**
	 * Returns the cell template definitions to insert in the provided row
	 * as defined by its list of columns to display.
	 */
	private _getCellTemplatesForRow(rowDef: RowColumnsDirective<T>): CellTemplateDirective[] {
		if (!rowDef.columns) { return []; }
		return rowDef.columns.map(columnId => {
			const column = this._columnDefsByName.get(columnId);

			if (!column) {
				throw TableErrors.getUnknownColumnError(columnId);
			}

			return column.cell;
		});
	}
}
