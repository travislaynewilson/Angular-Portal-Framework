import {
	Inject,
	Output,
	EventEmitter,
	OnDestroy,
	OnInit,
	ElementRef,
	Directive,
	Optional,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	ComponentFactoryResolver,
	ViewContainerRef,
	forwardRef,
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { PortalOutletDirective } from '@app/cdk';
import { TabBodyComponent } from './tab-body.component';



/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _TabBodyPortalBaseClass = PortalOutletDirective;



/** The portal host directive for the contents of the tab. */
@Directive({
	selector: '[appTabBodyHost]'
})
export class TabBodyPortalDirective extends _TabBodyPortalBaseClass implements OnInit, OnDestroy {

	/** A subscription to events for when the tab body begins centering. */
	private _centeringSub: Subscription;

	constructor (
		_componentFactoryResolver: ComponentFactoryResolver,
		_viewContainerRef: ViewContainerRef,
		@Inject(forwardRef(() => TabBodyComponent)) private _host: TabBodyComponent) {
		super(_componentFactoryResolver, _viewContainerRef);
	}

	/** Set initial visibility or set up subscription for changing visibility. */
	ngOnInit(): void {
		if (this._host._isCenterPosition(this._host._position)) {
			this.attach(this._host._content);
		} else {
			this._centeringSub = this._host._beforeCentering.subscribe(() => {
				this.attach(this._host._content);
				this._centeringSub.unsubscribe();
			});
		}
	}

	/** Clean up subscription if necessary. */
	ngOnDestroy(): void {
		if (this._centeringSub && !this._centeringSub.closed) {
			this._centeringSub.unsubscribe();
		}
	}
}