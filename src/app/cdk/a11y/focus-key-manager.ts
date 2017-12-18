import { FocusableOption } from './focusable-option';
import { ListKeyManager } from './list-key-manager';



export class FocusKeyManager<T> extends ListKeyManager<FocusableOption & T> {
	/**
	 * This method sets the active item to the item at the specified index.
	 * It also adds focuses the newly active item.
	 */
	setActiveItem(index: number): void {
		super.setActiveItem(index);

		if (this.activeItem) {
			this.activeItem.focus();
		}
	}
}
