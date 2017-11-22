import {
    ViewContainerRef,
	ElementRef,
	TemplateRef
} from '@angular/core';
import { ComponentType } from './component-type';
import { Portal } from './portal';
import { PortalOutlet } from './portal-outlet';


/**
 * A `TemplatePortal` is a portal that represents some embedded template (TemplateRef).
 */
export class TemplatePortal<C> extends Portal<C> {
	
	/** The embedded template that will be used to instantiate an embedded View in the host. */
	templateRef: TemplateRef<C>;
  
	/** Reference to the ViewContainer into which the template will be stamped out. */
	viewContainerRef: ViewContainerRef;
  
	context: C | undefined;
  
	constructor(template: TemplateRef<any>, viewContainerRef: ViewContainerRef, context?: C) {
	  super();
	  this.templateRef = template;
	  this.viewContainerRef = viewContainerRef;
	  if (context) {
		this.context = context;
	  }
	}
  
	get origin(): ElementRef {
	  return this.templateRef.elementRef;
	}
  
	/**
	 * Attach the the portal to the provided `PortalOutlet`.
	 * When a context is provided it will override the `context` property of the `TemplatePortal`
	 * instance.
	 */
	attach(host: PortalOutlet, context: C | undefined = this.context): C {
	  this.context = context;
	  return super.attach(host);
	}
  
	detach(): void {
	  this.context = undefined;
	  return super.detach();
	}
}