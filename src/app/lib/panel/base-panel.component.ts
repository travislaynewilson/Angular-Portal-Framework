import {
	Component,
	ViewEncapsulation,
	ChangeDetectorRef,
	ChangeDetectionStrategy
} from '@angular/core';
import { AccordionItemDirective } from '@app/cdk/accordion';
import {
	CoercionHelper,
	UniqueSelectionDispatcherService
} from '@app/cdk';
import {
	CanDisable,
	DisabledMixin
} from '@app/lib/core';
import { PanelGroupDirective } from './panel-group.directive';



/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _AccordionItemDirective = AccordionItemDirective;



// Boilerplate for applying mixins to PanelComponent.
@Component({
	template: '',
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelComponentCore extends _AccordionItemDirective {
	constructor (accordion: PanelGroupDirective,
		_changeDetectorRef: ChangeDetectorRef,
		_uniqueSelectionDispatcherService: UniqueSelectionDispatcherService) {
		super(accordion, _changeDetectorRef, _uniqueSelectionDispatcherService);
	}
}



export const BasePanelComponent = DisabledMixin(PanelComponentCore)