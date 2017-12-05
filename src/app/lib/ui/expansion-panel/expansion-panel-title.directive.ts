import { Directive } from '@angular/core';



/**
 * <app-panel-title> directive.
 *
 * This direction is to be used inside of the ExpansionPanelHeaderComponent component.
 */
@Directive({
	selector: 'app-panel-title',
	host: {
		class: 'app-expansion-panel-header-title'
	}
})
export class ExpansionPanelTitleDirective { }