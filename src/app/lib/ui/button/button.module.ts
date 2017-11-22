import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  BlockButtonDirective,
  ButtonComponent, 
  ComboButtonDirective,
  FilledButtonDirective,
  IconButtonDirective,
  LinkButtonDirective,
  OutlineButtonDirective,
  RaisedButtonDirective,
} from './button.component';

import { IconModule } from '@app/lib/ui/icon';

@NgModule({
  imports: [
    CommonModule,
    IconModule
  ],
  exports: [
    BlockButtonDirective,
    ButtonComponent,
    ComboButtonDirective,
    FilledButtonDirective,
    IconButtonDirective,
    LinkButtonDirective,
    OutlineButtonDirective,
    RaisedButtonDirective
  ],
  declarations: [
    BlockButtonDirective,
    ButtonComponent,
    ComboButtonDirective,
    FilledButtonDirective,
    IconButtonDirective,
    LinkButtonDirective,
    OutlineButtonDirective,
    RaisedButtonDirective
  ]
})
export class ButtonModule { }
