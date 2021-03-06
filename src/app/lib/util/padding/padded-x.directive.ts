import { Directive, Input } from '@angular/core';
import { CoercionHelper } from '@app/cdk';
import { DefaultScaffoldingSize, PaddingHelper } from './padding-helper';



@Directive({
	selector: '[paddedX]',
	host: {
		'[style.padding-left]': 'size',
		'[style.padding-right]': 'size'
	}
})
export class PaddedXDirective {
	private _size: number = DefaultScaffoldingSize;

	@Input('paddedX')
	get size() {
		return this._size + 'px';
	}
	set size(val: string | number | boolean) {
		val = PaddingHelper.coercePaddingSize(val);
		if (val !== this._size) {
			this._size = val;
		}
	}
}