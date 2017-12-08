import {
	Directive,
	ElementRef,
	NgModule,
	Output,
	Input,
	EventEmitter,
	OnDestroy,
	AfterContentInit,
	Injectable,
	NgZone,
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { MutationObserverFactory } from './mutation-observer.factory';



/**
 * Directive that triggers a callback whenever the content of
 * its associated element has changed.
 */
@Directive({
	selector: '[appObserveContent]',
	exportAs: 'appObserveContent',
})
export class ObserveContentDirective implements AfterContentInit, OnDestroy {
	private _observer: MutationObserver | null;

	/** Event emitted for each change in the element's content. */
	@Output('appObserveContent') event = new EventEmitter<MutationRecord[]>();

	/** Used for debouncing the emitted values to the observeContent event. */
	private _debouncer = new Subject<MutationRecord[]>();

	/** Debounce interval for emitting the changes. */
	@Input() debounce: number;

	constructor (
		private _mutationObserverFactory: MutationObserverFactory,
		private _elementRef: ElementRef,
		private _ngZone: NgZone) { }

	ngAfterContentInit () {
		if (this.debounce > 0) {
			this._ngZone.runOutsideAngular(() => {
				this._debouncer.pipe(debounceTime(this.debounce))
					.subscribe((mutations: MutationRecord[]) => this.event.emit(mutations));
			});
		} else {
			this._debouncer.subscribe(mutations => this.event.emit(mutations));
		}

		this._observer = this._ngZone.runOutsideAngular(() => {
			return this._mutationObserverFactory.create((mutations: MutationRecord[]) => {
				this._debouncer.next(mutations);
			});
		});

		if (this._observer) {
			this._observer.observe(this._elementRef.nativeElement, {
				'characterData': true,
				'childList': true,
				'subtree': true
			});
		}
	}

	ngOnDestroy () {
		if (this._observer) {
			this._observer.disconnect();
		}

		this._debouncer.complete();
	}
}
