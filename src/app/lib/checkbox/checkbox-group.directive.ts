import {
	AfterViewInit,
	Attribute,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChildren,
	Directive,
	ElementRef,
	EventEmitter,
	forwardRef,
	Input,
	OnDestroy,
	Output,
	QueryList,	
	Renderer2,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import { CoercionHelper } from '@app/cdk';
import { CheckboxComponent } from './checkbox.component';



// Increasing integer for generating unique ids for checkbox components.
let nextUniqueId = 0;



/**
 * A group of checkboxes. May contain one or more `<app-checkbox>` elements.
 */
@Directive({
	selector: 'app-checkbox-group',
	exportAs: 'appCheckboxGroup',
	host: {
		'role': 'checkboxgroup',
		'class': 'app-checkbox-group',
		'[class.app-checkbox-group-stacked]': 'stacked'
	}
})
export class CheckboxGroupDirective {

	/** The HTML name attribute applied to checkboxes in this group. */
	private _name: string = `app-checkbox-group-${nextUniqueId++}`;

	/** Whether the checkbox group is stacked or inline. */
	private _stacked: boolean = true;

	/** Child checkbox buttons. */
	@ContentChildren(forwardRef(() => CheckboxComponent), { descendants: true })
	_checkboxes: QueryList<CheckboxComponent>;

	/** Whether the checkbox group is stacked or inline */
	@Input()
	get stacked(): boolean { return this._stacked; }
	set stacked(value) {
		this._stacked = CoercionHelper.coerceBoolean(value);
		this._markCheckboxesForCheck();
	}

	constructor () { }

	_markCheckboxesForCheck() {
		if (this._checkboxes) {
			this._checkboxes.forEach(checkbox => checkbox._markForCheck());
		}
	}
}