/** Errors commonly thrown by table components */
export const TableErrors = {
	/**
	 * Returns an error to be thrown when attempting to find an unexisting column.
	 * @param id Id whose lookup failed.
	 */
	getUnknownColumnError: (id: string) => {
		return Error(`Could not find column with id "${id}".`);
	},

	/** Returns an error to be thrown when two column definitions have the same name. */
	getDuplicateColumnNameError: (name: string) => {
		return Error(`Duplicate column definition name provided: "${name}".`);
	},

	/** Returns an error to be thrown when there are multiple rows that are missing a when function. */
	getMultipleDefaultRowDefsError: () => {
		return Error(`There can only be one default row without a when predicate function.`);
	},

	/** Returns an error to be thrown when there are no matching row defs for a particular set of data. */
	getMissingMatchingRowDefError: () => {
		return Error(`Could not find a matching row definition for the provided row data.`);
	},

	/** Returns an error to be thrown when there is no row definitions present in the content. */
	getMissingRowDefsError: () => {
		return Error('Missing definitions for header and row, ' +
			'cannot determine which columns should be rendered.');
	}
};