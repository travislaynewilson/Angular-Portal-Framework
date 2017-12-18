import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	SimpleChanges,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CoercionHelper, TemplatePortal } from '@app/cdk';
import { TabLabelDirective } from '../tab-label.directive';



@Component({
	selector: 'app-tab',
	exportAs: 'appTab',
	templateUrl: './tab.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class TabComponent implements OnInit, OnChanges, OnDestroy {

	private _disabled: boolean = false;

	@Input()
	get disabled() { return this._disabled; }
	set disabled(value: any) { this._disabled = CoercionHelper.coerceBoolean(value); }

	/** Content for the tab label given by <ng-template app-tab-label>. */
	@ContentChild(TabLabelDirective) templateLabel: TabLabelDirective;

	/** Template inside the MatTab view that contains an <ng-content>. */
	@ViewChild(TemplateRef) _content: TemplateRef<any>;

	/** The plain text label for the tab, used when there is no template label. */
	@Input('label') textLabel: string = '';

	/** The portal that will be the hosted content of the tab */
	private _contentPortal: TemplatePortal<any> | null = null;
	get content(): TemplatePortal<any> | null { return this._contentPortal; }

	/** Emits whenever the label changes. */
	_labelChange = new Subject<void>();

	/** Emits whenevfer the disable changes */
	_disableChange = new Subject<void>();

	/**
	 * The relatively indexed position where 0 represents the center, negative is left, and positive
	 * represents the right.
	 */
	position: number | null = null;

	/**
	 * The initial relatively index origin of the tab if it was created and selected after there
	 * was already a selected tab. Provides context of what position the tab should originate from.
	 */
	origin: number | null = null;

	/**
	 * Whether the tab is currently active.
	 */
	isActive = false;

	constructor (private _viewContainerRef: ViewContainerRef) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.hasOwnProperty('textLabel')) {
			this._labelChange.next();
		}

		if (changes.hasOwnProperty('disabled')) {
			this._disableChange.next();
		}
	}

	ngOnDestroy(): void {
		this._disableChange.complete();
		this._labelChange.complete();
	}

	ngOnInit(): void {
		this._contentPortal = new TemplatePortal(this._content, this._viewContainerRef);
	}
}
