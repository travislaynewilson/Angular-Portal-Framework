import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { PortalDirective } from '@app/core/portal';



/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _TabLabelBaseClass = PortalDirective;



/** Used to flag tab labels for use with the portal directive */
@Directive({
	selector: '[appTabLabel]',
})
export class TabLabelDirective extends _TabLabelBaseClass {
	constructor (templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
		super(templateRef, viewContainerRef);
	}
}
