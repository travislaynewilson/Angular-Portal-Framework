import { Constructor } from './constructor';
import { CanDisable } from './disabled.mixin';



export interface HasTabIndex {
	tabIndex: number;
}



/** Mixin to augment a directive with a `tabIndex` property. */
export function TabIndexMixin<T extends Constructor<CanDisable>>(base: T, defaultTabIndex = 0) : Constructor<HasTabIndex> & T {
	return class extends base {
		private _tabIndex: number = defaultTabIndex;

		get tabIndex (): number { return this.disabled ? -1 : this._tabIndex; }
		set tabIndex (value: number) {
			// If the specified tabIndex value is null or undefined, fall back to the default value.
			this._tabIndex = value != null ? value : defaultTabIndex;
		}

		constructor (...args: any[]) {
			super(...args);
		}
	};
}

