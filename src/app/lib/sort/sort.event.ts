import { SortDirection } from './sort-direction';



export class SortEvent {
	constructor (public active: string, public direction: SortDirection) { }
}