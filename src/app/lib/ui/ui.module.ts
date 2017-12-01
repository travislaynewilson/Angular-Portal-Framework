import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './button';
import { IconModule } from './icon';
import { MenuModule } from './menu';
import { NotificationModule } from './notification';
import { ProgressBarModule } from './progress-bar';
import { SliderModule } from './slider';
import { TooltipModule } from './tooltip';

@NgModule({
    imports: [
        ButtonModule,
        CommonModule,
        IconModule,
        MenuModule,
        NotificationModule,
        ProgressBarModule,
        SliderModule,
        TooltipModule
    ],
    exports: [
        ButtonModule,
        IconModule,
        MenuModule,
        NotificationModule,
        ProgressBarModule,
        SliderModule,
        TooltipModule
    ]
})
export class UIModule {}