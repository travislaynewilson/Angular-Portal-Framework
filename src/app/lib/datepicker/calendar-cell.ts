/** An internal class that represents the data corresponding to a single calendar cell. */
export class CalendarCell {
	constructor (public value: number,
		public displayValue: string,
		public ariaLabel: string,
		public enabled: boolean) { }
}