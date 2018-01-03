import { Directive, ViewContainerRef } from '@angular/core';



/** Provides a handle for the table to grab the view container's ng-container to insert the header. */
@Directive({
	selector: '[headerRowPlaceholder]',
	exportAs: 'headerRowPlaceholder'
})
export class HeaderRowPlaceholderDirective {
	constructor (public viewContainer: ViewContainerRef) { }
}