import {
    throwNullPortalOutletError,
    throwPortalAlreadyAttachedError,
    throwNoPortalAttachedError,
    throwNullPortalError,
    throwPortalOutletAlreadyDisposedError,
    throwUnknownPortalTypeError
} from './portal-errors';
import { PortalOutlet } from './portal-outlet';


/**
 * A `Portal` is something that you want to render somewhere else.
 * It can be attach to / detached from a `PortalOutlet`.
 */
export abstract class Portal<T> {
	private _attachedHost: PortalOutlet | null;
  
	/** Attach this portal to a host. */
	attach(host: PortalOutlet): T {
	  if (host == null) {
		throwNullPortalOutletError();
	  }
  
	  if (host.hasAttached()) {
		throwPortalAlreadyAttachedError();
	  }
  
	  this._attachedHost = host;
	  return <T> host.attach(this);
	}
  
	/** Detach this portal from its host */
	detach(): void {
	  let host = this._attachedHost;
  
	  if (host == null) {
		throwNoPortalAttachedError();
	  } else {
		this._attachedHost = null;
		host.detach();
	  }
	}
  
	/** Whether this portal is attached to a host. */
	get isAttached(): boolean {
	  return this._attachedHost != null;
	}
  
	/**
	 * Sets the PortalOutlet reference without performing `attach()`. This is used directly by
	 * the PortalOutlet when it is performing an `attach()` or `detach()`.
	 */
	setAttachedHost(host: PortalOutlet | null) {
	  this._attachedHost = host;
	}
}