import { Injectable } from '@angular/core';



/**
 * Factory that creates a new MutationObserver and allows us to stub it out in unit tests.
 */
@Injectable()
export class MutationObserverFactory {
	create(callback: MutationCallback): MutationObserver | null {
		return typeof MutationObserver === 'undefined' ? null : new MutationObserver(callback);
	}
}
