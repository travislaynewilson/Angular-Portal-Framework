import {
    Directive,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { TemplatePortal } from './template-portal';


/**
 * Directive version of a `TemplatePortal`. Because the directive *is* a TemplatePortal,
 * the directive instance itself can be attached to a host, enabling declarative use of portals.
 */
@Directive({
  selector: '[app-portal], [appPortal], [portal]',
  exportAs: 'appPortal',
})
export class PortalDirective extends TemplatePortal<any> {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}