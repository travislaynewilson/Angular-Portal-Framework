import { CoercionHelper } from '@app/cdk/helpers';
import { Constructor } from './constructor';



export interface CanDisable {
	disabled: boolean;
}



/** Mixin to augment a directive with a `disabled` property. */
export function DisabledMixin<T extends Constructor<{}>>(base: T): Constructor<CanDisable> & T {
	return class extends base {
		private _disabled: boolean = false;

		get disabled () { return this._disabled; }
		set disabled (value: any) { this._disabled = CoercionHelper.coerceBoolean(value); }

		constructor (...args: any[]) { super(...args); }
	};
}
