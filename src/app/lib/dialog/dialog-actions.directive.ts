import { Directive } from '@angular/core';



/**
 * Container for the bottom action buttons in a dialog.
 * Stays fixed to the bottom when scrolling.
 */
@Directive({
	selector: `app-dialog-actions, [appDialogActions]`,
	host: { 'class': 'app-dialog-actions' }
})
export class DialogActionsDirective { }