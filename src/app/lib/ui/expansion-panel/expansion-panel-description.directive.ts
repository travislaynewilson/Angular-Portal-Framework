import { Directive } from '@angular/core';



/**
 * <app-panel-description> directive.
 *
 * This direction is to be used inside of the ExpansionPanelHeaderComponent component.
 */
@Directive({
	selector: 'app-panel-description',
	host: {
		class: 'app-expansion-panel-header-description'
	}
})
export class ExpansionPanelDescriptionDirective { }