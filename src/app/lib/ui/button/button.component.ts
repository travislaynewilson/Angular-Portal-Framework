import {
	ChangeDetectionStrategy,
	Component,
	Directive,
	ElementRef,
	Input,
	OnInit,
	Renderer2
} from '@angular/core';


@Directive({
	selector: 'button[appButton], a[appButton]',
	host: { 'class': 'btn btn-filled' }
})
export class FilledButtonDirective { }

@Directive({
	selector: 'button[appOutlineButton], a[appOutlineButton]',
	host: { 'class': 'btn btn-outline' }
})
export class OutlineButtonDirective { }

@Directive({
	selector: 'button[appLinkButton], a[appLinkButton]',
	host: { 'class': 'btn btn-link' }
})
export class LinkButtonDirective { }

@Directive({
	selector: 'button[appIconButton], a[appIconButton]',
	host: { 'class': 'btn-icon' }
})
export class IconButtonDirective { }

@Directive({
	selector: 'button[appComboButton], a[appComboButton]',
	host: { 'class': 'btn-combo' }
})
export class ComboButtonDirective { }

@Directive({
	selector: 'button[appRaisedButton], a[appRaisedButton]',
	host: { 'class': 'btn-raised' }
})
export class RaisedButtonDirective { }

@Directive({
	selector: 'button[appBlockButton], a[appBlockButton]',
	host: { 'class': 'btn-block' }
})
export class BlockButtonDirective { }



/** Possible button theme values  */
export type ButtonTheme = 'text' | 'primary' | 'success' | 'danger' | 'warning' | undefined;

/** Possible button type values  */
export type ButtonType = 'button' | 'submit' | 'reset' | undefined;



@Component({
	selector: `button[appButton], a[appButton],
button[appOutlineButton], a[appOutlineButton],             
button[appLinkButton], a[appLinkButton]
`,
	exportAs: 'appButton',
	host: {
		'[attr.tabindex]': 'disabled ? -1 : 0',
		'[attr.disabled]': 'disabled || null',
		'[attr.aria-disabled]': 'disabled.toString()',
		'(click)': 'onClick($event)'
	},
	template: `<ng-content></ng-content>`,
	styleUrls: ['./button.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent implements OnInit {

	@Input() disabled: boolean = false;

	@Input()
	get type() {
		return this._type;
	}
	set type(val) {
		if(val !== this._type) {
			this.setType(val);
		}
	}
	private _type: ButtonType;

	// Color
	_defaultColor: ButtonTheme = 'primary';
	_color: ButtonTheme;

	get color (): ButtonTheme {
		return this._color;
	};
	@Input() set color (value: ButtonTheme) {
		const _value = value || this._defaultColor;

		// Only change the element if we've actually changed the color
		if (_value !== this._color) {
			if (this._color) {
				this.renderer.removeClass(this.elementRef.nativeElement, `btn-theme-${this._color}`);
			}
			if (_value) {
				this.renderer.addClass(this.elementRef.nativeElement, `btn-theme-${_value}`);
			}

			this._color = _value;
		}
	}


	constructor (
		private renderer: Renderer2,
		private elementRef: ElementRef
	) {
		this.color = this._defaultColor;
	}
	
	ngOnInit () {
		this.setType();
	}

	onClick (event: Event) {
		if (this.disabled) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	}

	isButton(): boolean {
		return this.elementRef.nativeElement.tagName.toLowerCase() === 'button';
	}

	private setType(val?: ButtonType) {
		if(this.isButton()) {
			this._type = val || this._type || 'button';
			this.renderer.setAttribute(this.elementRef.nativeElement, 'type', this._type);
		}
	}
}
