import {
	ComponentRef,
	EmbeddedViewRef
} from '@angular/core';
import {
    throwPortalAlreadyAttachedError,
    throwNullPortalError,
    throwPortalOutletAlreadyDisposedError,
    throwUnknownPortalTypeError
} from './portal-errors';
import { ComponentPortal } from './component-portal';
import { TemplatePortal } from './template-portal';
import { Portal } from './portal';
import { PortalOutlet } from './portal-outlet';


/**
 * Partial implementation of PortalOutlet that handles attaching
 * ComponentPortal and TemplatePortal.
 */
export abstract class BasePortalOutlet implements PortalOutlet {

	/** The portal currently attached to the host. */
	private _attachedPortal: Portal<any> | null;
  
	/** A function that will permanently dispose this host. */
	private _disposeFn: (() => void) | null;
  
	/** Whether this host has already been permanently disposed. */
	private _isDisposed: boolean = false;
  
	/** Whether this host has an attached portal. */
	hasAttached(): boolean {
	  return !!this._attachedPortal;
	}
  
	/** Attaches a portal. */
	attach(portal: Portal<any>): any {
	  if (!portal) {
			throwNullPortalError();
	  }
  
	  if (this.hasAttached()) {
			throwPortalAlreadyAttachedError();
	  }
  
	  if (this._isDisposed) {
			throwPortalOutletAlreadyDisposedError();
	  }
  
	  if (portal instanceof ComponentPortal) {
			this._attachedPortal = portal;
			return this.attachComponentPortal(portal);
	  } else if (portal instanceof TemplatePortal) {
			this._attachedPortal = portal;
			return this.attachTemplatePortal(portal);
	  }
  
	  throwUnknownPortalTypeError();
	}
  
	abstract attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
  
	abstract attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
  
	/** Detaches a previously attached portal. */
	detach(): void {
	  if (this._attachedPortal) {
			this._attachedPortal.setAttachedHost(null);
			this._attachedPortal = null;
	  }
  
	  this._invokeDisposeFn();
	}
  
	/** Permanently dispose of this portal host. */
	dispose(): void {
	  if (this.hasAttached()) {
			this.detach();
	  }
  
	  this._invokeDisposeFn();
	  this._isDisposed = true;
	}
  
	setDisposeFn(fn: () => void) {
	  this._disposeFn = fn;
	}
  
	private _invokeDisposeFn() {
	  if (this._disposeFn) {
		this._disposeFn();
		this._disposeFn = null;
	  }
	}
}