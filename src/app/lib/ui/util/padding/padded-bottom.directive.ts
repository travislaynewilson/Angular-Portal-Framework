import { Directive, Input } from '@angular/core';
import { CoercionHelper } from '@app/core/util';
import { DefaultScaffoldingSize, PaddingHelper } from './padding-helper';



@Directive({
	selector: '[paddedBottom]',
	host: {
		'[style.padding-bottom]': 'size'
	}
})
export class PaddedBottomDirective {
	private _size: number = DefaultScaffoldingSize;

	@Input('paddedBottom')
	get size () {
		return this._size + 'px';
	}
	set size (val: string | number | boolean) {
		val = PaddingHelper.coercePaddingSize(val);
		if (val !== this._size) {
			this._size = val;
		}
	}
}