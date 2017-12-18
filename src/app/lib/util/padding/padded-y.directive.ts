import { Directive, Input } from '@angular/core';
import { CoercionHelper } from '@app/cdk';
import { DefaultScaffoldingSize, PaddingHelper } from './padding-helper';



@Directive({
	selector: '[paddedY]',
	host: {
		'[style.padding-top]': 'size',
		'[style.padding-bottom]': 'size'
	}
})
export class PaddedYDirective {
	private _size: number = DefaultScaffoldingSize;

	@Input('paddedT')
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