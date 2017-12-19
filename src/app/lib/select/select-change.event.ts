import { SelectComponent } from './select.component';



/** Change event object that is emitted when the select value has changed. */
export class SelectChangeEvent {
	constructor (public source: SelectComponent, public value: any) { }
}