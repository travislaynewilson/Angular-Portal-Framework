import { Directive } from '@angular/core';



/**
 * <app-panel-title> directive.
 *
 * This direction is to be used inside of the PanelHeaderComponent component.
 */
@Directive({
	selector: 'app-panel-title',
	host: {
		class: 'app-panel-title'
	}
})
export class PanelTitleDirective { }