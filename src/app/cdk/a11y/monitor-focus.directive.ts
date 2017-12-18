import {
	Directive,
	ElementRef,
	EventEmitter,
	OnDestroy,
	Output
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FocusOrigin } from './focus-origin';
import { FocusMonitorService } from './focus-monitor.service';



/**
 * Directive that determines how a particular element was focused (via keyboard, mouse, touch, or
 * programmatically) and adds corresponding classes to the element.
 *
 * There are two variants of this directive:
 * 1) appMonitorElementFocus: does not consider an element to be focused if one of its children is
 *    focused.
 * 2) appMonitorSubtreeFocus: considers an element focused if it or any of its children are focused.
 */
@Directive({
	selector: '[appMonitorElementFocus], [appMonitorSubtreeFocus]',
})
export class MonitorFocusDirective implements OnDestroy {
	private _monitorSubscription: Subscription;
	@Output('appFocusChange') focusChange = new EventEmitter<FocusOrigin>();

	constructor (private _elementRef: ElementRef, private _focusMonitor: FocusMonitorService) {
		this._monitorSubscription = this._focusMonitor.monitor(
			this._elementRef.nativeElement,
			this._elementRef.nativeElement.hasAttribute('appMonitorSubtreeFocus'))
			.subscribe(origin => this.focusChange.emit(origin));
	}

	ngOnDestroy() {
		this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
		this._monitorSubscription.unsubscribe();
	}
}