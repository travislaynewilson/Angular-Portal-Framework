import { DateFormat } from './date-format.type';



export const MOMENT_DATE_FORMAT: DateFormat = {
	parse: {
		dateInput: 'l',
	},
	display: {
		dateInput: 'l',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};
