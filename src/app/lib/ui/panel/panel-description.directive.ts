import { Directive } from '@angular/core';



/**
 * <app-panel-description> directive.
 *
 * This direction is to be used inside of the PanelHeaderComponent component.
 */
@Directive({
	selector: 'app-panel-description',
	host: {
		class: 'app-panel-description'
	}
})
export class PanelDescriptionDirective { }