import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@app/core/overlay';

import {MenuComponent, MENU_DEFAULT_OPTIONS} from './menu.component';
import {MenuItemComponent} from './menu-item.component';
import {MenuTriggerDirective} from './menu-trigger.directive';
import {MENU_SCROLL_STRATEGY_PROVIDER} from './menu-scroll.strategy';;


@NgModule({
  imports: [
    OverlayModule,
    CommonModule
  ],
  exports: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
  declarations: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
  providers: [
    MENU_SCROLL_STRATEGY_PROVIDER,
    {
      provide: MENU_DEFAULT_OPTIONS,
      useValue: {
        overlapTrigger: true,
        xPosition: 'after',
        yPosition: 'below'
      }
    }
  ]
})
export class MenuModule {}