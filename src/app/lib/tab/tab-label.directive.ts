import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { PortalDirective } from '@app/cdk';



/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _PortalDirective = PortalDirective;



/** Used to flag tab labels for use with the portal directive */
@Directive({
	selector: '[appTabLabel]'
})
export class TabLabelDirective extends _PortalDirective {
	constructor (templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
		super(templateRef, viewContainerRef);
	}
}
