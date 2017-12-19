import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './button';
import { CardModule } from './card';
import { CheckboxModule } from './checkbox';
import { DatepickerModule } from './datepicker';
import { DialogModule } from './dialog';
import { FormFieldModule } from './form-field';
import { PanelModule } from './panel';
import { IconModule } from './icon';
import { InputModule } from './input';
import { MenuModule } from './menu';
import { NotificationModule } from './notification';
import { ProgressBarModule } from './progress-bar';
import { RadioModule } from './radio';
import { SelectModule } from './select';
import { SlideToggleModule } from './slide-toggle';
import { SliderModule } from './slider';
import { TabModule } from './tab';
import { TooltipModule } from './tooltip';
import { UtilModule } from './util';



@NgModule({
	imports: [
		ButtonModule,
		CardModule,
		CheckboxModule,
		CommonModule,
		DatepickerModule,
		DialogModule,
		FormFieldModule,
		IconModule,
		InputModule,
		MenuModule,
		NotificationModule,
		PanelModule,
		ProgressBarModule,
		RadioModule,
		SelectModule,
		SlideToggleModule,
		SliderModule,
		TabModule,
		TooltipModule,
		UtilModule
	],
	exports: [
		ButtonModule,
		CardModule,
		CheckboxModule,
		DialogModule,
		DatepickerModule,
		FormFieldModule,
		IconModule,
		InputModule,
		MenuModule,
		NotificationModule,
		PanelModule,
		ProgressBarModule,
		RadioModule,
		SelectModule,
		SlideToggleModule,
		SliderModule,
		TabModule,
		TooltipModule,
		UtilModule
	]
})
export class LibModule { }