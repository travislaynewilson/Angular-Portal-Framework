import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './button';
import { IconModule } from './icon';
import { NotificationModule } from './notification';
import { TooltipModule } from './tooltip';

@NgModule({
    imports: [
        ButtonModule,
        CommonModule,
        IconModule,
        NotificationModule,
        TooltipModule
    ],
    exports: [
        ButtonModule,
        IconModule,
        NotificationModule,
        TooltipModule
    ]
})
export class UIModule {}