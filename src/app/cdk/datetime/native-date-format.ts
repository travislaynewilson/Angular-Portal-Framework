import { DateFormat } from './date-format.type';



export const NATIVE_DATE_FORMAT: DateFormat = {
	parse: {
		dateInput: null,
	},
	display: {
		dateInput: { year: 'numeric', month: 'numeric', day: 'numeric' },
		monthYearLabel: { year: 'numeric', month: 'short' },
		dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
		monthYearA11yLabel: { year: 'numeric', month: 'long' }
	}
};
