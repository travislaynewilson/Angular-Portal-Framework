import { Directive } from '@angular/core';



/**
 * <app-panel-actions> directive.
 *
 * This direction is to be used inside of the PanelHeaderComponent component.
 */
@Directive({
	selector: 'app-panel-actions',
	host: {
		class: 'app-panel-actions'
	}
})
export class PanelActionsDirective { }