import { ListKeyManagerOption } from './list-key-manager-option';



/**
 * This is the interface for focusable items (used by the FocusKeyManager).
 * Each item must know how to focus itself, whether or not it is currently disabled
 * and be able to supply it's label.
 */
export interface FocusableOption extends ListKeyManagerOption {
	focus(): void;
}