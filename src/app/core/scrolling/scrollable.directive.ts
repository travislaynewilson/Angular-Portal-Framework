
import {Directive, ElementRef, OnInit, OnDestroy, NgZone, Renderer2} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {ScrollDispatcher} from './scroll-dispatcher';


/**
 * Sends an event when the element is scrolled. Registers itself with the
 * ScrollDispatcher service to include itself as part of its collection of scrolling events that it
 * can be listened to through the service.
 */
@Directive({
  selector: '[app-scrollable], [appScrollable]'
})
export class ScrollableDirective implements OnInit, OnDestroy {
  private _scrolled: Subject<Event> = new Subject();
  private _scrollListener: Function | null;

  constructor(private _elementRef: ElementRef,
              private _scroll: ScrollDispatcher,
              private _ngZone: NgZone,
              private _renderer: Renderer2) {}

  ngOnInit() {
    this._scrollListener = this._ngZone.runOutsideAngular(() => {
      return this._renderer.listen(this.getElementRef().nativeElement, 'scroll', (event: Event) => {
        this._scrolled.next(event);
      });
    });

    this._scroll.register(this);
  }

  ngOnDestroy() {
    this._scroll.deregister(this);

    if (this._scrollListener) {
      this._scrollListener();
      this._scrollListener = null;
    }
  }

  scrolled(): Observable<any> {
    return this._scrolled.asObservable();
  }

  getElementRef(): ElementRef {
    return this._elementRef;
  }
}