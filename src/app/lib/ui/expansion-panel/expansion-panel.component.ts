import { animate, state, style, transition, trigger } from '@angular/animations';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Directive,
	forwardRef,
	Host,
	Input,
	OnChanges,
	OnDestroy,
	Optional,
	SimpleChanges,
	ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { AccordionItemDirective } from '@app/core/accordion';
import { UniqueSelectionDispatcherService } from '@app/core/collections';
import { CoercionHelper } from '@app/core/util';
import { ExpansionPanelAccordionDirective } from './expansion-panel-accordion.directive';
import { BaseExpansionPanelComponent } from './base-expansion-panel.component';



/** ExpansionPanel's states. */
export type ExpansionPanelState = 'expanded' | 'collapsed';

/** Time and timing curve for expansion panel animations. */
export const EXPANSION_PANEL_ANIMATION_TIMING = '225ms cubic-bezier(0.4,0.0,0.2,1)';

/**
 * <app-expansion-panel> component.
 *
 * This component can be used as a single element to show expandable content, or as one of
 * multiple children of an element with the appAccordion directive attached.
 */
@Component({
	styleUrls: ['./expansion-panel.component.scss'],
	selector: 'app-expansion-panel',
	exportAs: 'appExpansionPanel',
	templateUrl: './expansion-panel.component.html',
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush,
	inputs: ['disabled', 'expanded'],
	outputs: ['opened', 'closed'],
	host: {
		'class': 'app-expansion-panel',
		'[class.app-expanded]': 'expanded',
		'[class.app-expansion-panel-spacing]': '_hasSpacing()',
	},
	providers: [
		{ provide: BaseExpansionPanelComponent, useExisting: forwardRef(() => ExpansionPanelComponent) }
	],
	animations: [
		trigger('bodyExpansion', [
			state('collapsed', style({ height: '0px', visibility: 'hidden' })),
			state('expanded', style({ height: '*', visibility: 'visible' })),
			transition('expanded <=> collapsed', animate(EXPANSION_PANEL_ANIMATION_TIMING)),
		]),
	]
})
export class ExpansionPanelComponent extends BaseExpansionPanelComponent implements OnChanges, OnDestroy {

	/** Whether the toggle indicator should be hidden. */
	@Input()
	get hideToggle (): boolean {
		return this._hideToggle;
	}
	set hideToggle (value: boolean) {
		this._hideToggle = CoercionHelper.coerceBoolean(value);
	}
	private _hideToggle = false;

	/** Stream that emits for changes in `@Input` properties. */
	_inputChanges = new Subject<SimpleChanges>();

	/** Optionally defined accordion the expansion panel belongs to. */
	accordion: ExpansionPanelAccordionDirective;

	constructor ( @Optional() @Host() accordion: ExpansionPanelAccordionDirective,
		_changeDetectorRef: ChangeDetectorRef,
		_uniqueSelectionDispatcherService: UniqueSelectionDispatcherService) {
		super(accordion, _changeDetectorRef, _uniqueSelectionDispatcherService);
		this.accordion = accordion;
	}

	/** Whether the expansion indicator should be hidden. */
	_getHideToggle (): boolean {
		if (this.accordion) {
			return this.accordion.hideToggle;
		}
		return this.hideToggle;
	}

	/** Determines whether the expansion panel should have spacing between it and its siblings. */
	_hasSpacing (): boolean {
		if (this.accordion) {
			return (this.expanded ? this.accordion.displayMode : this._getExpandedState()) === 'default';
		}
		return false;
	}

	/** Gets the expanded state string. */
	_getExpandedState (): ExpansionPanelState {
		return this.expanded ? 'expanded' : 'collapsed';
	}

	ngOnChanges (changes: SimpleChanges) {
		this._inputChanges.next(changes);
	}

	ngOnDestroy () {
		this._inputChanges.complete();
	}
}