import {
	AfterContentChecked,
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChildren,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	Output,
	QueryList,
	Renderer2,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import { merge } from 'rxjs/observable/merge';
import { Subscription } from 'rxjs/Subscription';
import { CoercionHelper } from '@app/cdk';
import { TabComponent } from '../tab/tab.component';
import { TabHeaderComponent } from '../tab-header/tab-header.component';



/** Used to generate unique ID's for each tab component */
let nextId = 0;



/** A simple change event emitted on focus or selection changes. */
export class TabChangeEvent {
	index: number;
	tab: TabComponent;
}



/** Possible positions for the tab header. */
export type TabHeaderPosition = 'above' | 'below';



/**
 * Supports basic tab pairs (label + content) and includes
 * animated ink-bar, keyboard navigation, and screen reader.
 */
@Component({
	selector: 'app-tab-group',
	exportAs: 'appTabGroup',
	templateUrl: './tab-group.component.html',
	styleUrls: ['./tab-group.component.scss', '../tabs-theme.scss'],
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'class': 'app-tab-group',
		'[class.app-tab-group-dynamic-height]': 'dynamicHeight',
		'[class.app-tab-group-inverted-header]': 'headerPosition === "below"'
	}
})
export class TabGroupComponent implements AfterContentInit, AfterContentChecked, OnDestroy {

	@ContentChildren(TabComponent) _tabs: QueryList<TabComponent>;

	@ViewChild('tabBodyWrapper') _tabBodyWrapper: ElementRef;

	/** The tab index that should be selected after the content has been checked. */
	private _indexToSelect: number | null = 0;

	/** Snapshot of the height of the tab body wrapper before another tab is activated. */
	private _tabBodyWrapperHeight: number = 0;

	/** Subscription to tabs being added/removed. */
	private _tabsSubscription = Subscription.EMPTY;

	/** Subscription to changes in the tab labels. */
	private _tabLabelSubscription = Subscription.EMPTY;

	/** Whether the tab group should grow to the size of the active tab. */
	@Input()
	get dynamicHeight(): boolean { return this._dynamicHeight; }
	set dynamicHeight(value: boolean) { this._dynamicHeight = CoercionHelper.coerceBoolean(value); }
	private _dynamicHeight: boolean = true;

	/** The index of the active tab. */
	@Input()
	set selectedIndex(value: number | null) {
		this._indexToSelect = CoercionHelper.coerceNumber(value, null);
	}
	get selectedIndex(): number | null { return this._selectedIndex; }
	private _selectedIndex: number | null = null;

	private _groupId: number;

	/** Position of the tab header. */
	@Input() headerPosition: TabHeaderPosition = 'above';

	/** Output to enable support for two-way binding on `[(selectedIndex)]` */
	@Output() selectedIndexChange: EventEmitter<number> = new EventEmitter();

	/** Event emitted when focus has changed within a tab group. */
	@Output() focusChange: EventEmitter<TabChangeEvent> = new EventEmitter<TabChangeEvent>();

	/** Event emitted when the tab selection has changed. */
	@Output() selectedTabChange: EventEmitter<TabChangeEvent> =
		new EventEmitter<TabChangeEvent>(true);


	constructor (private _renderer: Renderer2,
		private _elementRef: ElementRef,
		private _changeDetectorRef: ChangeDetectorRef) {
		this._groupId = nextId++;
	}

	/**
	 * After the content is checked, this component knows what tabs have been defined
	 * and what the selected index should be. This is where we can know exactly what position
	 * each tab should be in according to the new selected index, and additionally we know how
	 * a new selected tab should transition in (from the left or right).
	 */
	ngAfterContentChecked(): void {
		// Clamp the next selected index to the boundsof 0 and the tabs length.
		// Note the `|| 0`, which ensures that values like NaN can't get through
		// and which would otherwise throw the component into an infinite loop
		// (since Math.max(NaN, 0) === NaN).
		let indexToSelect = this._indexToSelect =
			Math.min(this._tabs.length - 1, Math.max(this._indexToSelect || 0, 0));

		// If there is a change in selected index, emit a change event. Should not trigger if
		// the selected index has not yet been initialized.
		if (this._selectedIndex != indexToSelect && this._selectedIndex != null) {
			const tabChangeEvent = this._createChangeEvent(indexToSelect);
			this.selectedTabChange.emit(tabChangeEvent);
			// Emitting this value after change detection has run
			// since the checked content may contain this variable'
			Promise.resolve().then(() => this.selectedIndexChange.emit(indexToSelect));
		}

		// Setup the position for each tab and optionally setup an origin on the next selected tab.
		this._tabs.forEach((tab: TabComponent, index: number) => {
			tab.position = index - indexToSelect;
			tab.isActive = index === indexToSelect;

			// If there is already a selected tab, then set up an origin for the next selected tab
			// if it doesn't have one already.
			if (this._selectedIndex != null && tab.position == 0 && !tab.origin) {
				tab.origin = indexToSelect - this._selectedIndex;
			}
		});

		if (this._selectedIndex !== indexToSelect) {
			this._selectedIndex = indexToSelect;
			this._changeDetectorRef.markForCheck();
		}
	}

	ngAfterContentInit() {
		this._subscribeToTabLabels();

		// Subscribe to changes in the amount of tabs, in order to be
		// able to re-render the content as new tabs are added or removed.
		this._tabsSubscription = this._tabs.changes.subscribe(() => {
			this._subscribeToTabLabels();
			this._changeDetectorRef.markForCheck();
		});
	}

	ngOnDestroy() {
		this._tabsSubscription.unsubscribe();
		this._tabLabelSubscription.unsubscribe();
	}

	_focusChanged(index: number) {
		this.focusChange.emit(this._createChangeEvent(index));
	}

	private _createChangeEvent(index: number): TabChangeEvent {
		const event = new TabChangeEvent;
		event.index = index;
		if (this._tabs && this._tabs.length) {
			event.tab = this._tabs.toArray()[index];
		}
		return event;
	}

	/**
	 * Subscribes to changes in the tab labels. This is needed, because the @Input for the label is
	 * on the MatTab component, whereas the data binding is inside the MatTabGroup. In order for the
	 * binding to be updated, we need to subscribe to changes in it and trigger change detection
	 * manually.
	 */
	private _subscribeToTabLabels() {
		if (this._tabLabelSubscription) {
			this._tabLabelSubscription.unsubscribe();
		}

		this._tabLabelSubscription = merge(
			...this._tabs.map(tab => tab._disableChange),
			...this._tabs.map(tab => tab._labelChange)).subscribe(() => {
				this._changeDetectorRef.markForCheck();
			});
	}

	/** Returns a unique id for each tab label element */
	_getTabLabelId(i: number): string {
		return `mat-tab-label-${this._groupId}-${i}`;
	}

	/** Returns a unique id for each tab content element */
	_getTabContentId(i: number): string {
		return `mat-tab-content-${this._groupId}-${i}`;
	}

	/**
	 * Sets the height of the body wrapper to the height of the activating tab if dynamic
	 * height property is true.
	 */
	_setTabBodyWrapperHeight(tabHeight: number): void {
		if (!this._dynamicHeight || !this._tabBodyWrapperHeight) { return; }

		this._renderer.setStyle(this._tabBodyWrapper.nativeElement, 'height',
			this._tabBodyWrapperHeight + 'px');

		// This conditional forces the browser to paint the height so that
		// the animation to the new height can have an origin.
		if (this._tabBodyWrapper.nativeElement.offsetHeight) {
			this._renderer.setStyle(this._tabBodyWrapper.nativeElement, 'height',
				tabHeight + 'px');
		}
	}

	/** Removes the height of the tab body wrapper. */
	_removeTabBodyWrapperHeight(): void {
		this._tabBodyWrapperHeight = this._tabBodyWrapper.nativeElement.clientHeight;
		this._renderer.setStyle(this._tabBodyWrapper.nativeElement, 'height', '');
	}

	/** Handle click events, setting new selected index if appropriate. */
	_handleClick(tab: TabComponent, tabHeader: TabHeaderComponent, idx: number) {
		if (!tab.disabled) {
			this.selectedIndex = tabHeader.focusIndex = idx;
		}
	}

	/** Retrieves the tabindex for the tab. */
	_getTabIndex(tab: TabComponent, idx: number): number | null {
		if (tab.disabled) {
			return null;
		}
		return this.selectedIndex === idx ? 0 : -1;
	}
}
