import {FocusableOption} from '@app/core/a11y'; 
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {CoercionHelper} from '@app/core/util';
import {Subject} from 'rxjs/Subject';


/** This component is intended to be used inside an app-menu tag. */
@Component({
  moduleId: module.id,
  selector: '[app-menu-item], [appMenuItem]',
  exportAs: 'appMenuItem',
  inputs: ['disabled'],
  host: {
    'role': 'menuitem',
    'class': 'app-menu-item',
    '[class.app-menu-item-highlighted]': '_highlighted',
    '[class.app-menu-item-submenu-trigger]': '_triggersSubmenu',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
    '(click)': '_checkDisabled($event)',
    '(mouseenter)': '_emitHoverEvent()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  template: `<ng-content></ng-content>`,
})
export class MenuItemComponent implements FocusableOption, OnDestroy {

  private _disabled: boolean = false;
  
  get disabled() { return this._disabled; }
  set disabled(value: any) { this._disabled = CoercionHelper.coerceBoolean(value); }

  /** Stream that emits when the menu item is hovered. */
  _hovered: Subject<MenuItemComponent> = new Subject();

  /** Whether the menu item is highlighted. */
  _highlighted: boolean = false;

  /** Whether the menu item acts as a trigger for a sub-menu. */
  _triggersSubmenu: boolean = false;

  constructor(private _elementRef: ElementRef) { }

  /** Focuses the menu item. */
  focus(): void {
    this._getHostElement().focus();
  }

  ngOnDestroy() {
    this._hovered.complete();
  }

  /** Used to set the `tabindex`. */
  _getTabIndex(): string {
    return this.disabled ? '-1' : '0';
  }

  /** Returns the host DOM element. */
  _getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /** Prevents the default element actions if it is disabled. */
  _checkDisabled(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /** Emits to the hover stream. */
  _emitHoverEvent() {
    if (!this.disabled) {
      this._hovered.next(this);
    }
  }

  /** Gets the label to be used when determining whether the option should be focused. */
  getLabel(): string {
    const element: HTMLElement = this._elementRef.nativeElement;
    let output = '';

    if (element.childNodes) {
      const length = element.childNodes.length;

      // Go through all the top-level text nodes and extract their text.
      // We skip anything that's not a text node to prevent the text from
      // being thrown off by something like an icon.
      for (let i = 0; i < length; i++) {
        if (element.childNodes[i].nodeType === Node.TEXT_NODE) {
          output += element.childNodes[i].textContent;
        }
      }
    }

    return output.trim();
  }
}