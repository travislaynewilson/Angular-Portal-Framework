import { Observable } from 'rxjs/Observable';



/**
 * Interface for any component that provides a view of some data collection and wants to provide
 * information regarding the view and any changes made.
 */
export interface CollectionViewer {
	viewChange: Observable<{ start: number, end: number }>;
}
