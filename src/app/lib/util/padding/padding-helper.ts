import { CoercionHelper } from '@app/cdk';



export const DefaultScaffoldingSize: number = 16;



export class PaddingHelper {
	static coercePaddingSize(val: string | number | boolean): number {
		let result = val;

		if (typeof result === 'string') {
			if (!result.toString().length) {
				result = true;
			}
			if (CoercionHelper.couldBeBoolean(result)) {
				result = (CoercionHelper.coerceBoolean(result) === true ? DefaultScaffoldingSize : 0);
			}
		}

		result = CoercionHelper.coerceNumber(result);
		return result;
	}
}