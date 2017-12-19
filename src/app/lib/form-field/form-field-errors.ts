export const FormFieldErrors = {
	getPlaceholderConflictError(): Error {
		return Error('Placeholder attribute and child element were both specified.');
	},
	getDuplicatedHintError(align: string): Error {
		return Error(`A hint was already declared for 'align="${align}"'.`);
	},
	getMissingControlError(): Error {
		return Error('app-form-field must contain a BaseFormFieldControl.');
	}
};