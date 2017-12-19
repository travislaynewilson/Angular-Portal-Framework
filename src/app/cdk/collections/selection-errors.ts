export const SelectionErrors = {

	/**
	 * Returns an error that reports that multiple values are passed into a selection context
	 * with a single value.
	 */
	getMultipleValuesInSingleSelectionError() {
		return Error('Cannot pass multiple values into SelectionContext with single-value mode.');
	}
};