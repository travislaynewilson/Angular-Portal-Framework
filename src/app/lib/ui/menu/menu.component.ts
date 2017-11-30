/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEvent} from '@angular/animations';
import {FocusKeyManager} from '@app/core/a11y';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
import {first} from 'rxjs/operators/first';
import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	ElementRef,
	EventEmitter,
	Inject,
	InjectionToken,
	Input,
	OnDestroy,
	Output,
	QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  NgZone,
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {Subscription} from 'rxjs/Subscription';
import {fadeInItems, transformMenu} from './menu-animations';
import {throwMatMenuInvalidPositionX, throwMatMenuInvalidPositionY} from './menu-errors';
import {MenuItemComponent} from './menu-item.component';
import {MenuPanel} from './menu-panel';
import {MenuPositionX, MenuPositionY} from './menu-positions';
import {KeyCodes} from '@app/core/keycodes';
import {CoercionHelper} from '@app/core/util';


/** Default `menu` options that can be overridden. */
export interface MenuDefaultOptions {
  xPosition: MenuPositionX;
  yPosition: MenuPositionY;
  overlapTrigger: boolean;
}

/** Injection token to be used to override the default options for `app-menu`. */
export const MENU_DEFAULT_OPTIONS =
    new InjectionToken<MenuDefaultOptions>('menu-default-options');

/** Start elevation for the menu panel. */
const MENU_BASE_ELEVATION = 2;


@Component({
  moduleId: module.id,
  selector: 'app-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  animations: [
    transformMenu,
    fadeInItems
  ],
  exportAs: 'appMenu'
})
export class MenuComponent implements AfterContentInit, MenuPanel, OnDestroy {
  private _keyManager: FocusKeyManager<MenuItemComponent>;
  private _xPosition: MenuPositionX = this._defaultOptions.xPosition;
  private _yPosition: MenuPositionY = this._defaultOptions.yPosition;
  private _previousElevation: string;

  /** Subscription to tab events on the menu panel */
  private _tabSubscription = Subscription.EMPTY;

  /** Config object to be passed into the menu's ngClass */
  _classList: {[key: string]: boolean} = {};

  /** Current state of the panel animation. */
  _panelAnimationState: 'void' | 'enter-start' | 'enter' = 'void';

  /** Parent menu of the current menu panel. */
  parentMenu: MenuPanel | undefined;

  /** Position of the menu in the X axis. */
  @Input()
  get xPosition() { return this._xPosition; }
  set xPosition(value: MenuPositionX) {
    if (value !== 'before' && value !== 'after') {
      throwMatMenuInvalidPositionX();
    }
    this._xPosition = value;
    this.setPositionClasses();
  }

  /** Position of the menu in the Y axis. */
  @Input()
  get yPosition() { return this._yPosition; }
  set yPosition(value: MenuPositionY) {
    if (value !== 'above' && value !== 'below') {
      throwMatMenuInvalidPositionY();
    }
    this._yPosition = value;
    this.setPositionClasses();
  }

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  /** List of the items inside of a menu. */
  @ContentChildren(MenuItemComponent) items: QueryList<MenuItemComponent>;

  /** Whether the menu should overlap its trigger. */
  @Input()
  set overlapTrigger(value: boolean) {
    this._overlapTrigger = CoercionHelper.coerceBoolean(value);
  }
  get overlapTrigger(): boolean {
    return this._overlapTrigger;
  }
  private _overlapTrigger: boolean = this._defaultOptions.overlapTrigger;

  /**
   * This method takes classes set on the host app-menu element and applies them on the
   * menu template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing menu from outside the component.
   * @param classes list of class names
   */
  @Input('class')
  set panelClass(classes: string) {
    if (classes && classes.length) {
      this._classList = classes.split(' ').reduce((obj: any, className: string) => {
        obj[className] = true;
        return obj;
      }, {});

      this._elementRef.nativeElement.className = '';
      this.setPositionClasses();
    }
  }

  /**
   * This method takes classes set on the host app-menu element and applies them on the
   * menu template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing menu from outside the component.
   * @deprecated Use `panelClass` instead.
   */
  @Input()
  set classList(classes: string) { this.panelClass = classes; }
  get classList(): string { return this.panelClass; }

  /** Event emitted when the menu is closed. */
  @Output() closed = new EventEmitter<void | 'click' | 'keydown'>();

  /**
   * Event emitted when the menu is closed.
   * @deprecated Switch to `closed` instead
   */
  @Output() close = this.closed;

  constructor(
    private _elementRef: ElementRef,
    private _ngZone: NgZone,
    @Inject(MENU_DEFAULT_OPTIONS) private _defaultOptions: MenuDefaultOptions) { }

  ngAfterContentInit() {
    this._keyManager = new FocusKeyManager<MenuItemComponent>(this.items).withWrap().withTypeAhead();
    this._tabSubscription = this._keyManager.tabOut.subscribe(() => this.close.emit('keydown'));
  }

  ngOnDestroy() {
    this._tabSubscription.unsubscribe();
    this.closed.emit();
    this.closed.complete();
  }

  /** Stream that emits whenever the hovered menu item changes. */
  _hovered(): Observable<MenuItemComponent> {
    if (this.items) {
      return this.items.changes.pipe(
        startWith(this.items),
        switchMap(items => merge(...items.map(item => item._hovered)))
      );
    }

    return this._ngZone.onStable
      .asObservable()
      .pipe(first(), switchMap(() => this._hovered()));
  }

  /** Handle a keyboard event from the menu, delegating to the appropriate action. */
  _handleKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case KeyCodes.ESCAPE:
        this.closed.emit('keydown');
        event.stopPropagation();
      break;
      case KeyCodes.LEFT_ARROW:
        if (this.parentMenu) {
          this.closed.emit('keydown');
        }
      break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  /**
   * Focus the first item in the menu. This method is used by the menu trigger
   * to focus the first item when the menu is opened by the ENTER key.
   */
  focusFirstItem() {
    this._keyManager.setFirstItemActive();
  }

  /**
   * Resets the active item in the menu. This is used when the menu is opened by mouse,
   * allowing the user to start from the first option when pressing the down arrow.
   */
  resetActiveItem() {
    this._keyManager.setActiveItem(-1);
  }

  /**
   * It's necessary to set position-based classes to ensure the menu panel animation
   * folds out from the correct direction.
   */
  setPositionClasses(posX: MenuPositionX = this.xPosition, posY: MenuPositionY = this.yPosition) {
    this._classList['app-menu-before'] = posX === 'before';
    this._classList['app-menu-after'] = posX === 'after';
    this._classList['app-menu-above'] = posY === 'above';
    this._classList['app-menu-below'] = posY === 'below';
  }

  /**
   * Sets the menu panel elevation.
   * @param depth Number of parent menus that come before the menu.
   */
  setElevation(depth: number): void {
    // The elevation starts at the base and increases by one for each level.
    const newElevation = `app-elevation-z${MENU_BASE_ELEVATION + depth}`;
    const customElevation = Object.keys(this._classList).find(c => c.startsWith('app-elevation-z'));

    if (!customElevation || customElevation === this._previousElevation) {
      if (this._previousElevation) {
        this._classList[this._previousElevation] = false;
      }

      this._classList[newElevation] = true;
      this._previousElevation = newElevation;
    }
  }

  /** Starts the enter animation. */
  _startAnimation() {
    this._panelAnimationState = 'enter-start';
  }

  /** Resets the panel animation to its initial state. */
  _resetAnimation() {
    this._panelAnimationState = 'void';
  }

  /** Callback that is invoked when the panel animation completes. */
  _onAnimationDone(event: AnimationEvent) {
    // After the initial expansion is done, trigger the second phase of the enter animation.
    if (event.toState === 'enter-start') {
      this._panelAnimationState = 'enter';
    }
  }
}
