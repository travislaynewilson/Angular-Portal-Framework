import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './button';
import { IconModule } from './icon';
import { NotificationModule } from './notification';
import { ProgressBarModule } from './progress-bar';
import { TooltipModule } from './tooltip';

@NgModule({
    imports: [
        ButtonModule,
        CommonModule,
        IconModule,
        NotificationModule,
        ProgressBarModule,
        TooltipModule
    ],
    exports: [
        ButtonModule,
        IconModule,
        NotificationModule,
        ProgressBarModule,
        TooltipModule
    ]
})
export class UIModule {}