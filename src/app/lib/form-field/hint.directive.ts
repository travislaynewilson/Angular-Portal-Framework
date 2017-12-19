import { Directive, Input } from '@angular/core';



let nextUniqueId = 0;



/** Hint text to be shown underneath the form field control. */
@Directive({
	selector: 'app-hint',
	host: {
		'class': 'app-hint',
		'[class.app-right]': 'align == "end"',
		'[attr.id]': 'id',
		// Remove align attribute to prevent it from interfering with layout.
		'[attr.align]': 'null',
	}
})
export class HintDirective {
	
	/** Whether to align the hint label at the start or end of the line. */
	@Input() align: 'start' | 'end' = 'start';

	/** Unique ID for the hint. Used for the aria-describedby on the form field control. */
	@Input() id: string = `app-hint-${nextUniqueId++}`;
}
