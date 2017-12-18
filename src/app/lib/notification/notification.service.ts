import { ComponentRef, Injectable, Injector, Optional, SkipSelf } from '@angular/core';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { first } from 'rxjs/operators/first';
import { 
	BreakpointObserver,
	Breakpoints,
	ComponentPortal, 
	ComponentType,
	ObjectHelper,
	OverlayService, 
	OverlayConfig, 
	OverlayRef,
	PortalInjector
} from '@app/cdk';
import { SimpleNotificationComponent } from './simple-notification.component';
import { NOTIFICATION_DATA, NotificationConfig } from './notification-config';
import { NotificationContainerComponent } from './notification-container.component';
import { NotificationContext } from './notification-context';



/**
 * Service to dispatch Material Design notification messages.
 */
@Injectable()
export class NotificationService {
	/**
	 * Reference to the current notification in the view *at this level* (in the Angular injector tree).
	 * If there is a parent notification service, all operations should delegate to that parent
	 * via `_openedNotificationContext`.
	 */
	private _notificationContextAtThisLevel: NotificationContext<any> | null = null;

	/** Reference to the currently opened notification context at *any* level. */
	get _openedNotificationContext(): NotificationContext<any> | null {
		const parent = this._parentNotificationService;
		return parent ? parent._openedNotificationContext : this._notificationContextAtThisLevel;
	}

	set _openedNotificationContext(value: NotificationContext<any> | null) {
		if (this._parentNotificationService) {
			this._parentNotificationService._openedNotificationContext = value;
		} else {
			this._notificationContextAtThisLevel = value;
		}
	}

	constructor (
		private _overlayService: OverlayService,
		private _injector: Injector,
		private _breakpointObserver: BreakpointObserver,
		@Optional() @SkipSelf() private _parentNotificationService: NotificationService) { }

	/**
	 * Creates and dispatches a notification with a custom component for the content, removing any
	 * currently opened notifications.
	 *
	 * @param component Component to be instantiated.
	 * @param config Extra configuration for the notification.
	 */
	openFromComponent<T>(component: ComponentType<T>, config?: NotificationConfig): NotificationContext<T> {
		const _config = _applyConfigDefaults(config);
		const notificationContext = this._attach(component, _config);

		// When the notification is dismissed, clear the reference to it.
		notificationContext.afterDismissed().subscribe(() => {
			// Clear the notification context if it hasn't already been replaced by a newer notification.
			if (this._openedNotificationContext == notificationContext) {
				this._openedNotificationContext = null;
			}
		});

		if (this._openedNotificationContext) {
			// If a notification is already in view, dismiss it and enter the
			// new notification after exit animation is complete.
			this._openedNotificationContext.afterDismissed().subscribe(() => {
				notificationContext.containerInstance.enter();
			});
			this._openedNotificationContext.dismiss();
		} else {
			// If no notification is in view, enter the new notification.
			notificationContext.containerInstance.enter();
		}

		// If a dismiss timeout is provided, set up dismiss based on after the notification is opened.
		if (_config.duration && _config.duration > 0) {
			notificationContext.afterOpened().subscribe(() => notificationContext._dismissAfter(_config!.duration!));
		}

		this._openedNotificationContext = notificationContext;
		return this._openedNotificationContext;
	}

	/**
	 * Opens a notification with a message and an optional action.
	 * @param message The message to show in the notification.
	 * @param action The label for the notification action.
	 * @param config Additional configuration options for the notification.
	 */
	open(message: string, action: string = '', config?: NotificationConfig): NotificationContext<SimpleNotificationComponent> {
		const _config = _applyConfigDefaults(config);

		// Since the user doesn't have access to the component, we can
		// override the data to pass in our own message and action.
		_config.data = { message, action };

		return this.openFromComponent(SimpleNotificationComponent, _config);
	}

	/**
	 * Dismisses the currently-visible notification.
	 */
	dismiss(): void {
		if (this._openedNotificationContext) {
			this._openedNotificationContext.dismiss();
		}
	}

	/**
	 * Attaches the notification container component to the overlay.
	 */
	private _attachNotificationContainer(overlayRef: OverlayRef,
		config: NotificationConfig): NotificationContainerComponent {
		const containerPortal = new ComponentPortal(NotificationContainerComponent, config.viewContainerRef);
		const containerRef: ComponentRef<NotificationContainerComponent> = overlayRef.attach(containerPortal);
		containerRef.instance.notificationConfig = config;
		return containerRef.instance;
	}

	/**
	 * Places a new component as the content of the notification container.
	 */
	private _attach<T>(component: ComponentType<T>, config: NotificationConfig): NotificationContext<T> {
		const overlayRef = this._createOverlay(config);
		const container = this._attachNotificationContainer(overlayRef, config);
		const notificationContext = new NotificationContext<T>(container, overlayRef);
		const injector = this._createInjector(config, notificationContext);
		const portal = new ComponentPortal(component, undefined, injector);
		const contentRef = container.attachComponentPortal(portal);

		// We can't pass this via the injector, because the injector is created earlier.
		notificationContext.instance = contentRef.instance;

		return notificationContext;
	}

	/**
	 * Creates a new overlay and places it in the correct location.
	 * @param config The user-specified notification config.
	 */
	private _createOverlay(config: NotificationConfig): OverlayRef {
		const overlayConfig = new OverlayConfig();

		let positionStrategy = this._overlayService.position().global();

		// Set horizontal position.
		if (config.horizontalPosition === 'left') {
			positionStrategy.left('0');
		} else if (config.horizontalPosition === 'right') {
			positionStrategy.right('0');
		} else {
			positionStrategy.centerHorizontally();
		}

		// Set horizontal position.
		if (config.verticalPosition === 'top') {
			positionStrategy.top('0');
		} else {
			positionStrategy.bottom('0');
		}

		overlayConfig.positionStrategy = positionStrategy;
		return this._overlayService.create(overlayConfig);
	}

	/**
	 * Creates an injector to be used inside of a notification component.
	 * @param config Config that was used to create the notification.
	 * @param context Reference to the notification.
	 */
	private _createInjector<T>(
		config: NotificationConfig,
		context: NotificationContext<T>): PortalInjector {

		const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
		const injectionTokens = new WeakMap();

		injectionTokens.set(NotificationContext, context);
		injectionTokens.set(NOTIFICATION_DATA, config.data);

		return new PortalInjector(userInjector || this._injector, injectionTokens);
	}
}



/**
 * Applies default options to the notification config.
 * @param config The configuration to which the defaults will be applied.
 * @returns The new configuration object with defaults applied.
 */
function _applyConfigDefaults(config?: NotificationConfig): NotificationConfig {
	return ObjectHelper.extendObject(new NotificationConfig(), config);
}
