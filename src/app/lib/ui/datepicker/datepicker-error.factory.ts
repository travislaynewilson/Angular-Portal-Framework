export class DatepickerErrorFactory {

	static createMissingDateImplError (provider: string) {
		return Error(
			`Datepicker: No provider found for ${provider}. You must import one of the following ` +
			`modules at your application root: NativeDateModule, MomentDateModule, or provide a ` +
			`custom implementation.`);
	}

}