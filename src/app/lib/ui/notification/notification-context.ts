import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {OverlayRef} from '@app/core/overlay';
import {NotificationContainerComponent} from './notification-container.component';

/** Reference to a notification dispatched from the notification service. */
export class NotificationContext<T> {

  /** The instance of the component making up the content of the notification. */
  instance: T;

  /** The instance of the component making up the content of the notification. */
  containerInstance: NotificationContainerComponent;

  /** Subject for notifying the user that the notification has closed. */
  private _afterClosed = new Subject<void>();

  /** Subject for notifying the user that the notification has opened and appeared. */
  private _afterOpened = new Subject<void>();

  /** Subject for notifying the user that the notification action was called. */
  private _onAction = new Subject<void>();

  /**
   * Timeout ID for the duration setTimeout call. Used to clear the timeout if the notification is
   * dismissed before the duration passes.
   */
  private _durationTimeoutId: number;

  constructor(containerInstance: NotificationContainerComponent,
              private _overlayRef: OverlayRef) {
    this.containerInstance = containerInstance;
    
    // Dismiss notification on action.
    this.onAction().subscribe(() => this.dismiss());
    containerInstance._onExit.subscribe(() => this._finishDismiss());
  }

  /** Dismisses the notification. */
  dismiss(): void {
    if (!this._afterClosed.closed) {
      this.containerInstance.exit();
    }
    clearTimeout(this._durationTimeoutId);
  }

  /** Marks the notification action clicked. */
  closeWithAction(): void {
    if (!this._onAction.closed) {
      this._onAction.next();
      this._onAction.complete();
    }
  }

  /** Dismisses the snack bar after some duration */
  _dismissAfter(duration: number): void {
    this._durationTimeoutId = setTimeout(() => this.dismiss(), duration);
  }

  /** Marks the notification as opened */
  _open(): void {
    if (!this._afterOpened.closed) {
      this._afterOpened.next();
      this._afterOpened.complete();
    }
  }

  /** Cleans up the DOM after closing. */
  private _finishDismiss(): void {
    this._overlayRef.dispose();

    if (!this._onAction.closed) {
      this._onAction.complete();
    }

    this._afterClosed.next();
    this._afterClosed.complete();
  }

  /** Gets an observable that is notified when the notification is finished closing. */
  afterDismissed(): Observable<void> {
    return this._afterClosed.asObservable();
  }

  /** Gets an observable that is notified when the notification has opened and appeared. */
  afterOpened(): Observable<void> {
    return this.containerInstance._onEnter;
  }

  /** Gets an observable that is notified when the notification action is called. */
  onAction(): Observable<void> {
    return this._onAction.asObservable();
  }
}
