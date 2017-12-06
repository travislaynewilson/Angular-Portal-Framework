import { Directive, Input } from '@angular/core';
import { AccordionDirective } from '@app/core/accordion';
import { CoercionHelper } from '@app/core/util';

/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _AccordionDirective = AccordionDirective;

/** PanelAccordionDirective's display modes. */
export type AccordionDisplayMode = 'default' | 'flat';

/**
 * Directive for an Accordion.
 */
@Directive({
	selector: 'app-panel-group',
	exportAs: 'appPanelGroup',
	host: {
		class: 'app-panel-group'
	}
})
export class PanelGroupDirective extends _AccordionDirective {

	/** Whether the indicator should be hidden. */
	@Input() get hideToggle (): boolean { return this._hideToggle; }
	set hideToggle (show: boolean) { this._hideToggle = CoercionHelper.coerceBoolean(show); }
	private _hideToggle: boolean = false;

	/**
	 * The display mode used for all panels in the accordion. Currently two display
	 * modes exist:
	 *   default - a gutter-like spacing is placed around any expanded panel, placing the expanded
	 *     panel at a different elevation from the reset of the accordion.
	 *  flat - no spacing is placed around expanded panels, showing all panels at the same
	 *     elevation.
	 */
	@Input() displayMode: AccordionDisplayMode = 'default';
}
