import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy } from '@angular/core';
import { DisabledMixin, CanDisable } from '@app/lib/core/mixins';



// Boilerplate for applying mixins to OptgroupComponent.
export class OptgroupComponentCore { }
export const BaseOptgroupComponent = DisabledMixin(OptgroupComponentCore);



// Counter for unique group ids.
let _uniqueOptgroupIdCounter = 0;



/**
 * Component that is used to group instances of `app-option`.
 */
@Component({
	selector: 'app-optgroup',
	exportAs: 'appOptgroup',
	templateUrl: './optgroup.component.html',
	styleUrls: ['./optgroup.component.scss'],
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush,
	inputs: ['disabled'],
	host: {
		'class': 'app-optgroup',
		'role': 'group',
		'[class.app-optgroup-disabled]': 'disabled',
		'[attr.aria-disabled]': 'disabled.toString()',
		'[attr.aria-labelledby]': '_labelId'
	}
})
export class OptgroupComponent extends BaseOptgroupComponent implements CanDisable {
	
	/** Label for the option group. */
	@Input() label: string;

	/** Unique id for the underlying label. */
	_labelId: string = `app-optgroup-label-${_uniqueOptgroupIdCounter++}`;
}
