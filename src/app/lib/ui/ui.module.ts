import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './button';
import { CardModule } from './card';
import { DatepickerModule } from './datepicker';
import { DialogModule } from './dialog';
import { PanelModule } from './panel';
import { IconModule } from './icon';
import { MenuModule } from './menu';
import { NotificationModule } from './notification';
import { ProgressBarModule } from './progress-bar';
import { SliderModule } from './slider';
import { TabModule } from './tab';
import { TooltipModule } from './tooltip';
import { UtilModule } from './util';

@NgModule({
	imports: [
		ButtonModule,
		CardModule,
		CommonModule,
		DatepickerModule,
		DialogModule,
		IconModule,
		MenuModule,
		NotificationModule,
		PanelModule,
		ProgressBarModule,
		SliderModule,
		TabModule,
		TooltipModule,
		UtilModule
	],
	exports: [
		ButtonModule,
		CardModule,
		DialogModule,
		DatepickerModule,
		IconModule,
		MenuModule,
		NotificationModule,
		PanelModule,
		ProgressBarModule,
		SliderModule,
		TabModule,
		TooltipModule,
		UtilModule
	]
})
export class UIModule { }