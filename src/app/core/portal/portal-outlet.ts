import { Portal } from './portal';

/** 
 * A `PortalOutlet` is an space that can contain a single `Portal`.
 */
export interface PortalOutlet {
	attach(portal: Portal<any>): any;
  
	detach(): any;
  
	dispose(): void;
  
	hasAttached(): boolean;
}