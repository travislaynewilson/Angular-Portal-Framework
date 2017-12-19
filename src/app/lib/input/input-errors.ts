export const InputErrors = {
	getUnsupportedTypeError(type: string): Error {
		return Error(`Input type "${type}" isn't supported by appInput.`);
	}
};