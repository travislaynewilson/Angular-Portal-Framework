import { Directive } from '@angular/core';


/**
 * Scrollable content container of a dialog.
 */
@Directive({
	selector: `app-dialog-content, [appDialogContent]`,
	host: { 'class': 'app-dialog-content' }
})
export class DialogContentDirective { }