import { NgModule } from '@angular/core';
import { UNIQUE_SELECTION_DISPATCHER_SERVICE_PROVIDER } from '@app/core/collections';
import { AccordionDirective } from './accordion.directive';
import { AccordionItemDirective } from './accordion-item.directive';

@NgModule({
	exports: [
		AccordionDirective, 
		AccordionItemDirective
	],
	declarations: [
		AccordionDirective, 
		AccordionItemDirective
	],
	providers: [
		UNIQUE_SELECTION_DISPATCHER_SERVICE_PROVIDER
	]
})
export class AccordionModule { }
