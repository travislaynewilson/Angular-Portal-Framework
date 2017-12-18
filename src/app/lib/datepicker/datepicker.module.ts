import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
	A11yModule,
	OverlayModule
} from '@app/cdk';
import { ButtonModule } from '@app/lib/button';
import { DialogModule } from '@app/lib/dialog';
import { IconModule } from '@app/lib/icon';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarBodyComponent } from './calendar-body/calendar-body.component';
import { DATEPICKER_SCROLL_STRATEGY_PROVIDER } from './datepicker-scroll.strategy';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { DatepickerContentComponent } from './datepicker-content/datepicker-content.component';
import { DatepickerInputDirective } from './datepicker-input.directive';
import { DatepickerIntlService } from './datepicker-intl.service';
import { DatepickerToggleComponent } from './datepicker-toggle/datepicker-toggle.component';
import { MonthViewComponent } from './month-view/month-view.component';
import { YearViewComponent } from './year-view/year-view.component';



@NgModule({
	imports: [
		CommonModule,
		ButtonModule,
		DialogModule,
		IconModule,
		OverlayModule,
		A11yModule
	],
	exports: [
		CalendarComponent,
		CalendarBodyComponent,
		DatepickerComponent,
		DatepickerContentComponent,
		DatepickerInputDirective,
		DatepickerToggleComponent,
		MonthViewComponent,
		YearViewComponent
	],
	declarations: [
		CalendarComponent,
		CalendarBodyComponent,
		DatepickerComponent,
		DatepickerContentComponent,
		DatepickerInputDirective,
		DatepickerToggleComponent,
		MonthViewComponent,
		YearViewComponent
	],
	providers: [
		DatepickerIntlService,
		DATEPICKER_SCROLL_STRATEGY_PROVIDER
	],
	entryComponents: [
		DatepickerContentComponent
	]
})
export class DatepickerModule { }
