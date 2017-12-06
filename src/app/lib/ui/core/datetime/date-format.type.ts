import { InjectionToken } from '@angular/core';



export type DateFormat = {
	parse: {
		dateInput: any
	},
	display: {
		dateInput: any,
		monthYearLabel: any,
		dateA11yLabel: any,
		monthYearA11yLabel: any
	}
};



export const DATE_FORMAT = new InjectionToken<DateFormat>('date-format');
