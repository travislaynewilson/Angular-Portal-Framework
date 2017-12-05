import {
	Component,
	ViewEncapsulation,
	ChangeDetectorRef,
	ChangeDetectionStrategy
} from '@angular/core';
import { AccordionItemDirective } from '@app/core/accordion';
import { UniqueSelectionDispatcherService } from '@app/core/collections';
import { CoercionHelper } from '@app/core/util';
import { ExpansionPanelAccordionDirective } from './expansion-panel-accordion.directive';



@Component({
	template: '',
	moduleId: module.id,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseExpansionPanelComponent extends AccordionItemDirective {
	constructor (accordion: ExpansionPanelAccordionDirective,
		_changeDetectorRef: ChangeDetectorRef,
		_uniqueSelectionDispatcherService: UniqueSelectionDispatcherService) {
		super(accordion, _changeDetectorRef, _uniqueSelectionDispatcherService);
	}

	private _disabled: boolean = false;

	get disabled () { return this._disabled; }
	set disabled (value: any) { this._disabled = CoercionHelper.coerceBoolean(value); }
}