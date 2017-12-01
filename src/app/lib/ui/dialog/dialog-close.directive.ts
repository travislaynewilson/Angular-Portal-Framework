import { Directive, Input } from '@angular/core';
import { DialogContext } from './dialog-context';



/**
 * Button that will close the current dialog.
 */
@Directive({
	selector: `button[appDialogClose]`,
	exportAs: 'appDialogClose',
	host: {
		'(click)': 'dialogContext.close(dialogResult)',
		'[attr.aria-label]': 'ariaLabel',
		'type': 'button'
	}
})
export class DialogCloseDirective {

	/** Screenreader label for the button. */
	@Input('aria-label') ariaLabel: string = 'Close dialog';

	@Input('matDialogClose') dialogResult: any;

	constructor (public dialogContext: DialogContext<any>) { }
}