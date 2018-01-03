import { Directive, ViewContainerRef } from '@angular/core';



/** Provides a handle for the table to grab the view container's ng-container to insert data rows. */
@Directive({ 
	selector: '[rowPlaceholder]',
	exportAs: 'rowPlaceholder'
})
export class RowPlaceholderDirective {
	constructor (public viewContainer: ViewContainerRef) { }
}