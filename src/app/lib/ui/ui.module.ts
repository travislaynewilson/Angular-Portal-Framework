import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './button';
import { CardModule } from './card';
import { DialogModule } from './dialog';
import { PanelModule } from './panel';
import { IconModule } from './icon';
import { MenuModule } from './menu';
import { NotificationModule } from './notification';
import { ProgressBarModule } from './progress-bar';
import { SliderModule } from './slider';
import { TooltipModule } from './tooltip';
import { UtilModule } from './util';

@NgModule({
	imports: [
		ButtonModule,
		CardModule,
		CommonModule,
		DialogModule,
		IconModule,
		MenuModule,
		NotificationModule,
		PanelModule,
		ProgressBarModule,
		SliderModule,
		TooltipModule,
		UtilModule
	],
	exports: [
		ButtonModule,
		CardModule,
		DialogModule,
		IconModule,
		MenuModule,
		NotificationModule,
		PanelModule,
		ProgressBarModule,
		SliderModule,
		TooltipModule,
		UtilModule
	]
})
export class UIModule { }