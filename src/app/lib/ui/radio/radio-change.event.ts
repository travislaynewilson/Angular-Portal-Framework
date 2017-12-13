import { RadioButtonComponent } from './radio-button.component';



/** Change event object emitted by RadioButtonComponent and RadioGroupDirective. */
export class RadioChangeEvent {
	
	/** The RadioButtonComponent that emits the change event. */
	source: RadioButtonComponent | null;

	/** The value of the RadioButtonComponent. */
	value: any;
}