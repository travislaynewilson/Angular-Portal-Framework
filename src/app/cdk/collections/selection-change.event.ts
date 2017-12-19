/** Describes an event emitted when the value of a MatSelectionModel has changed. */
export class SelectionChangeEvent<T> {
	constructor (public added?: T[], public removed?: T[]) { }
}