import { Directive, Input, OnInit, Optional } from '@angular/core';
import { DialogContext } from './dialog-context';
import { DialogContainerComponent } from './dialog-container.component';



/** Counter used to generate unique IDs for dialog elements. */
let dialogElementUid = 0;



/**
 * Title of a dialog element. Stays fixed to the top of the dialog when scrolling.
 */
@Directive({
	selector: '[appDialogTitle]',
	exportAs: 'appDialogTitle',
	host: {
		'class': 'app-dialog-title',
		'[id]': 'id',
	}
})
export class DialogTitleDirective implements OnInit {
	@Input() id = `app-dialog-title-${dialogElementUid++}`;

	constructor ( @Optional() private _container: DialogContainerComponent) { }

	ngOnInit() {
		if (this._container && !this._container._ariaLabelledBy) {
			Promise.resolve().then(() => this._container._ariaLabelledBy = this.id);
		}
	}
}