import {
	Component,
	ComponentRef,
	EmbeddedViewRef,
	ViewChild,
	NgZone,
	OnDestroy,
	Renderer2,
	ElementRef,
	ChangeDetectionStrategy,
	ViewEncapsulation,
	ChangeDetectorRef,
} from '@angular/core';
import {
	trigger,
	state,
	style,
	transition,
	animate,
	AnimationEvent,
} from '@angular/animations';
import { first } from 'rxjs/operators/first';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
	AnimationCurves,
	AnimationDurations,
	BasePortalOutlet,
	ComponentPortal,
	PortalOutletDirective
} from '@app/cdk';
import { NotificationConfig } from './notification-config';



export const SHOW_ANIMATION = `${AnimationDurations.ENTERING} ${AnimationCurves.DECELERATION_CURVE}`;



export const HIDE_ANIMATION = `${AnimationDurations.EXITING} ${AnimationCurves.ACCELERATION_CURVE}`;



/**
 * Internal component that wraps user-provided notification content.
 */
@Component({
	selector: 'app-notification-container',
	templateUrl: 'notification-container.component.html',
	styleUrls: ['notification-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	host: {
		'role': 'alert',
		'class': 'app-notification-container',
		'[@state]': '_animationState',
		'(@state.done)': 'onAnimationEnd($event)'
	},
	animations: [
		trigger('state', [
			state('visible-top, visible-bottom', style({ transform: 'translateY(0%)' })),
			transition('visible-top => hidden-top, visible-bottom => hidden-bottom',
				animate(HIDE_ANIMATION)),
			transition('void => visible-top, void => visible-bottom', animate(SHOW_ANIMATION)),
		])
	],
})
export class NotificationContainerComponent extends BasePortalOutlet implements OnDestroy {
	/** Whether the component has been destroyed. */
	private _destroyed = false;

	/** The portal outlet inside of this container into which the notification content will be loaded. */
	@ViewChild(PortalOutletDirective) _portalOutlet: PortalOutletDirective;

	/** Subject for notifying that the notification has exited from view. */
	_onExit: Subject<any> = new Subject();

	/** Subject for notifying that the notification has finished entering the view. */
	_onEnter: Subject<any> = new Subject();

	/** The state of the notification animations. */
	_animationState = 'void';

	/** The notification configuration. */
	notificationConfig: NotificationConfig;

	constructor (
		private _ngZone: NgZone,
		private _renderer: Renderer2,
		private _elementRef: ElementRef,
		private _changeDetectorRef: ChangeDetectorRef) {
		super();
	}

	/** Attach a component portal as content to this notification container. */
	attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
		if (this._portalOutlet.hasAttached()) {
			throw Error('Attempting to attach notification content after content is already attached');
		}

		if (this.notificationConfig.panelClass) {
			const classes = this._getCssClasses(this.notificationConfig.panelClass);

			// Not the most efficient way of adding classes, but the renderer doesn't allow us
			// to pass in an array or a space-separated list.
			for (let cssClass of classes) {
				this._renderer.addClass(this._elementRef.nativeElement, cssClass);
			}
		}

		if (this.notificationConfig.horizontalPosition === 'center') {
			this._renderer.addClass(this._elementRef.nativeElement, 'app-notification-center');
		}

		if (this.notificationConfig.verticalPosition === 'top') {
			this._renderer.addClass(this._elementRef.nativeElement, 'app-notification-top');
		}

		return this._portalOutlet.attachComponentPortal(portal);
	}

	/** Attach a template portal as content to this notification container. */
	attachTemplatePortal(): EmbeddedViewRef<any> {
		throw Error('Not yet implemented');
	}

	/** Handle end of animations, updating the state of the notification. */
	onAnimationEnd(event: AnimationEvent) {
		const { fromState, toState } = event;

		if ((toState === 'void' && fromState !== 'void') || toState.startsWith('hidden')) {
			this._completeExit();
		}

		if (toState.startsWith('visible')) {
			// Note: we shouldn't use `this` inside the zone callback,
			// because it can cause a memory leak.
			const onEnter = this._onEnter;

			this._ngZone.run(() => {
				onEnter.next();
				onEnter.complete();
			});
		}
	}

	/** Begin animation of notification entrance into view. */
	enter(): void {
		if (!this._destroyed) {
			this._animationState = `visible-${this.notificationConfig.verticalPosition}`;
			this._changeDetectorRef.detectChanges();
		}
	}

	/** Begin animation of the notification exiting from view. */
	exit(): Observable<void> {
		this._animationState = `hidden-${this.notificationConfig.verticalPosition}`;
		return this._onExit;
	}

	/** Makes sure the exit callbacks have been invoked when the element is destroyed. */
	ngOnDestroy() {
		this._destroyed = true;
		this._completeExit();
	}

	/**
	 * Waits for the zone to settle before removing the element. Helps prevent
	 * errors where we end up removing an element which is in the middle of an animation.
	 */
	private _completeExit() {
		this._ngZone.onMicrotaskEmpty.asObservable().pipe(first()).subscribe(() => {
			this._onExit.next();
			this._onExit.complete();
		});
	}

	/** Convert the class list to a array of classes it can apply to the dom */
	private _getCssClasses(classList: undefined | string | string[]) {
		if (classList) {
			if (Array.isArray(classList)) {
				return classList;
			} else {
				return [classList];
			}
		}
		return [];
	}
}
