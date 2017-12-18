import { Directive, ElementRef, Input } from '@angular/core';
import { CoercionHelper } from '@app/cdk';



/** Used in the `app-tab-group` view to display tab labels. */
@Directive({
	selector: '[appTabLabelWrapper]',
	host: {
		'[class.app-tab-disabled]': 'disabled'
	}
})
export class TabLabelWrapperDirective {

	private _disabled: boolean = false;

	@Input()
	get disabled() { return this._disabled; }
	set disabled(value: any) { this._disabled = CoercionHelper.coerceBoolean(value); }

	constructor (public elementRef: ElementRef) { }

	/** Sets focus on the wrapper element */
	focus(): void {
		this.elementRef.nativeElement.focus();
	}

	getOffsetLeft(): number {
		return this.elementRef.nativeElement.offsetLeft;
	}

	getOffsetWidth(): number {
		return this.elementRef.nativeElement.offsetWidth;
	}
}
