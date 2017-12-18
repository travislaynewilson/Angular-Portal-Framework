export class CoercionHelper {

	/** Wraps the provided value into an array in case the value isn't already an array */
	static coerceArray<T>(value: T | T[]): T[] {
		return Array.isArray(value) ? value : [value];
	}


	/** Converts the provided value into a boolean, if possible */
	static coerceBoolean(value: any): boolean {
		return value != null && `${value}` !== 'false';
	}

	static couldBeBoolean(value: any): boolean {
		if (value == null || value == undefined) {
			return false;
		}

		return typeof value === 'boolean' || ['true', 'false'].indexOf(`${value.toString().toLowerCase()}`) !== -1;
	}

	/** Converts the provided value into a number, if possible */
	static coerceNumber(value: any): number;
	static coerceNumber<D>(value: any, fallback: D): number | D;
	static coerceNumber(value: any, fallback = 0) {
		return isNaN(parseFloat(value)) || isNaN(Number(value)) ?
			fallback :
			Number(value);
	}

}