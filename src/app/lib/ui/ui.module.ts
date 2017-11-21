import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './button';
import { IconModule } from './icon';

@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        IconModule
    ],
    exports: [
        ButtonModule,
        IconModule
    ]
})
export class UIModule {}
