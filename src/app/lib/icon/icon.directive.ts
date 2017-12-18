import {
	Directive,
	ElementRef,
	Input,
	OnInit
} from '@angular/core';



@Directive({
	selector: '[appIcon]',
	host: {
		'class': 'icon material-icons app-icon'
	}
})
export class IconDirective {

	private _icon: string;
	get icon() {
		return this._icon;
	}
	@Input('appIcon') set icon(value: string) {
		if (value !== this._icon) {
			this._icon = value;
			this.elementRef.nativeElement.innerHTML = this._icon;
		}
	};

	constructor (private elementRef: ElementRef) { }
}