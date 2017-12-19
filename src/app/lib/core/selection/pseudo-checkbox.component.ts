import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy } from '@angular/core';



export type PseudoCheckboxState = 'unchecked' | 'checked' | 'indeterminate';



/**
 * Component that shows a simplified checkbox without including any kind of "real" checkbox.
 * Meant to be used when the checkbox is purely decorative and a large number of them will be
 * included, such as for the options in a multi-select. Uses no SVGs or complex animations.
 * Note that theming is meant to be handled by the parent element, e.g.
 * `app-primary .app-pseudo-checkbox`.
 *
 * Note that this component will be completely invisible to screen-reader users. This is *not*
 * interchangeable with <app-checkbox> and should *not* be used if the user would directly interact
 * with the checkbox. The pseudo-checkbox should only be used as an implementation detail of
 * more complex components that appropriately handle selected / checked state.
 */
@Component({
	selector: 'app-pseudo-checkbox',
	styleUrls: ['./pseudo-checkbox.component.scss'],
	template: '',
	host: {
		'class': 'app-pseudo-checkbox',
		'[class.app-pseudo-checkbox-indeterminate]': 'state === "indeterminate"',
		'[class.app-pseudo-checkbox-checked]': 'state === "checked"',
		'[class.app-pseudo-checkbox-disabled]': 'disabled'
	},
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PseudoCheckboxComponent {

	/** Display state of the checkbox. */
	@Input() state: PseudoCheckboxState = 'unchecked';

	/** Whether the checkbox is disabled. */
	@Input() disabled: boolean = false;
}
