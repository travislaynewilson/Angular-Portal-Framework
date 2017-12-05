import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './button';
import { CardModule } from './card';
import { DialogModule } from './dialog';
import { ExpansionPanelModule } from './expansion-panel';
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
		ExpansionPanelModule,
		IconModule,
		MenuModule,
		NotificationModule,
		ProgressBarModule,
		SliderModule,
		TooltipModule,
		UtilModule
	],
	exports: [
		ButtonModule,
		CardModule,
		DialogModule,
		ExpansionPanelModule,
		IconModule,
		MenuModule,
		NotificationModule,
		ProgressBarModule,
		SliderModule,
		TooltipModule,
		UtilModule
	]
})
export class UIModule { }