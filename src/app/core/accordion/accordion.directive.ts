import { Directive, Input } from '@angular/core';
import { CoercionHelper } from '@app/core/util';



/** Used to generate unique ID for each accordion. */
let nextId = 0;

/**
 * Directive whose purpose is to manage the expanded state of AccordionItemDirective children.
 */
@Directive({
	selector: 'app-accordion, [appAccordion]',
	exportAs: 'appAccordion',
})
export class AccordionDirective {
	/** A readonly id value to use for unique selection coordination. */
	readonly id = `app-accordion-${nextId++}`;

	/** Whether the accordion should allow multiple expanded accordion items simulateously. */
	@Input() get multi (): boolean { return this._multi; }
	set multi (multi: boolean) { this._multi = CoercionHelper.coerceBoolean(multi); }
	private _multi: boolean = false;
}
