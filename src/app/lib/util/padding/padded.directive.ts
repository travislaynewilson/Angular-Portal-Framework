import { Directive, Input } from '@angular/core';
import { CoercionHelper } from '@app/cdk';
import { DefaultScaffoldingSize, PaddingHelper } from './padding-helper';



@Directive({
	selector: '[padded]',
	host: {
		'[style.padding]': 'size'
	}
})
export class PaddedDirective {
	private _size: number = DefaultScaffoldingSize;

	@Input('padded')
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