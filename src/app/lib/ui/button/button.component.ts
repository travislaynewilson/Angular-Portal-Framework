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
  selector: 'button[app-button], a[app-button]',
  host: { 'class': 'btn btn-filled' }
})
export class FilledButtonDirective {}

@Directive({
  selector: 'button[app-outline-button], a[app-outline-button]',
  host: { 'class': 'btn btn-outline' }
})
export class OutlineButtonDirective {}

@Directive({
  selector: 'button[app-link-button], a[app-link-button]',
  host: { 'class': 'btn btn-link' }
})
export class LinkButtonDirective {}

@Directive({
  selector: 'button[app-icon-button], a[app-icon-button]',
  host: { 'class': 'btn-icon' }
})
export class IconButtonDirective {}

@Directive({
  selector: 'button[app-combo-button], a[app-combo-button]',
  host: { 'class': 'btn-combo' }
})
export class ComboButtonDirective {}

@Directive({
  selector: 'button[app-raised-button], a[app-raised-button]',
  host: { 'class': 'btn-raised' }
})
export class RaisedButtonDirective {}

@Directive({
  selector: 'button[app-block-button], a[app-block-button]',
  host: { 'class': 'btn-block' }
})
export class BlockButtonDirective {}



/** Possible button theme values  */
export type ButtonTheme = 'text' | 'primary' | 'success' | 'danger' | 'warning' | undefined;

@Component({
  selector: `button[app-button], a[app-button],
             button[app-outline-button], a[app-outline-button],             
             button[app-link-button], a[app-link-button]
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

  // Color
  _defaultColor: ButtonTheme = 'primary';
  _color: ButtonTheme;

  get color(): ButtonTheme {
    return this._color;
  };
  @Input() set color(value: ButtonTheme) {
    const _value = value || this. _defaultColor;

    // Only change the element if we've actually changed the color
    if(_value !== this._color) {
      if(this._color) {
        this.renderer.removeClass(this.elementRef.nativeElement, `btn-theme-${this._color}`);
      }
      if(_value) {
        this.renderer.addClass(this.elementRef.nativeElement, `btn-theme-${_value}`);
      }

      this._color = _value;
    }
  }


  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {
    this.color = this._defaultColor;
   }

  ngOnInit() {
    
  }

  onClick(event: Event) {
    if(this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
