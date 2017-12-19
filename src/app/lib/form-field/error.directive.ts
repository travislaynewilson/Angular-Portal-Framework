import { Directive, Input } from '@angular/core';



let nextUniqueId = 0;



/** Single error message to be shown underneath the form field. */
@Directive({
	selector: 'app-error',
	host: {
		'class': 'app-error',
		'role': 'alert',
		'[attr.id]': 'id'
	}
})
export class ErrorDirective {
	@Input() id: string = `app-error-${nextUniqueId++}`;
}
