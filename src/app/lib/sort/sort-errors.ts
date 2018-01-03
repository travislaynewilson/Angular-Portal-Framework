/** Errors commonly thrown by sort components */
export const SortErrors = {
	getDuplicateSortableIdError: (id: string): Error => {
		return Error(`Cannot have two MatSortables with the same id (${id}).`);
	},
	getHeaderNotContainedWithinSortError: (): Error => {
		return Error(`MatSortHeader must be placed within a parent element with the MatSort directive.`);
	},
	getHeaderMissingIdError: (): Error => {
		return Error(`MatSortHeader must be provided with a unique id.`);
	},
	getInvalidDirectionError: (direction: string): Error => {
		return Error(`${direction} is not a valid sort direction ('asc' or 'desc').`);
	}
};