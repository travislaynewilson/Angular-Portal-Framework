import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './button';
import { IconModule } from './icon';
import { TooltipModule } from './tooltip';

@NgModule({
    imports: [
        ButtonModule,
        CommonModule,
        IconModule,
        TooltipModule
    ],
    exports: [
        ButtonModule,
        IconModule,
        TooltipModule
    ]
})
export class UIModule {}
