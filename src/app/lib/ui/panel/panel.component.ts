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
import { AnimationCurves, AnimationDurations } from '@app/core/animation';
import { PanelGroupDirective } from './panel-group.directive';
import { BasePanelComponent } from './base-panel.component';



/** Panel's states. */
export type PanelState = 'expanded' | 'collapsed';

/** Time and timing curve for panel animations. */
export const PANEL_ANIMATION_TIMING = `${AnimationDurations.ENTERING} ${AnimationCurves.STANDARD_CURVE}`;



/**
 * <app-panel> component.
 *
 * This component can be used as a single element to show expandable content, or as one of
 * multiple children of an element with the appAccordion directive attached.
 */
@Component({
	selector: 'app-panel',
	exportAs: 'appPanel',
	templateUrl: './panel.component.html',
	styleUrls: ['./panel.component.scss'],
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush,
	inputs: ['disabled', 'expanded'],
	outputs: ['opened', 'closed'],
	host: {
		'class': 'app-panel',
		'[class.app-panel-expanded]': 'expanded',
		'[class.app-panel-spacing]': '_hasSpacing()'
	},
	providers: [
		{ provide: BasePanelComponent, useExisting: forwardRef(() => PanelComponent) }
	],
	animations: [
		trigger('bodyExpansion', [
			state('collapsed', style({ height: '0px', visibility: 'hidden' })),
			state('expanded', style({ height: '*', visibility: 'visible' })),
			transition('expanded <=> collapsed', animate(PANEL_ANIMATION_TIMING))
		])
	]
})
export class PanelComponent extends BasePanelComponent implements OnChanges, OnDestroy {

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

	/** Optionally defined accordion the panel belongs to. */
	accordion: PanelGroupDirective;

	constructor ( @Optional() @Host() accordion: PanelGroupDirective,
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

	/** Determines whether the panel should have spacing between it and its siblings. */
	_hasSpacing (): boolean {
		if (this.accordion) {
			return (this.expanded ? this.accordion.displayMode : this._getExpandedState()) === 'default';
		}
		return false;
	}

	/** Gets the expanded state string. */
	_getExpandedState (): PanelState {
		return this.expanded ? 'expanded' : 'collapsed';
	}

	ngOnChanges (changes: SimpleChanges) {
		this._inputChanges.next(changes);
	}

	ngOnDestroy () {
		this._inputChanges.complete();
	}
}