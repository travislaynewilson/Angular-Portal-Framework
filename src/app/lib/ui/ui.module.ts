import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './button';
import { IconModule } from './icon';
import { MenuModule } from './menu';
import { NotificationModule } from './notification';
import { ProgressBarModule } from './progress-bar';
import { TooltipModule } from './tooltip';

@NgModule({
    imports: [
        ButtonModule,
        CommonModule,
        IconModule,
        MenuModule,
        NotificationModule,
        ProgressBarModule,
        TooltipModule
    ],
    exports: [
        ButtonModule,
        IconModule,
        MenuModule,
        NotificationModule,
        ProgressBarModule,
        TooltipModule
    ]
})
export class UIModule {}