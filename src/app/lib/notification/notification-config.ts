import { ViewContainerRef, InjectionToken } from '@angular/core';



export const NOTIFICATION_DATA = new InjectionToken<any>('NotificationData');



/** Possible values for horizontalPosition on NotificationConfig. */
export type NotificationHorizontalPosition = 'center' | 'left' | 'right';



/** Possible values for verticalPosition on NotificationConfig. */
export type NotificationVerticalPosition = 'top' | 'bottom';



/**
 * Configuration used when opening a notification.
 */
export class NotificationConfig {
	/** The view container to place the overlay for the notification into. */
	viewContainerRef?: ViewContainerRef;

	/** The length of time in milliseconds to wait before automatically dismissing the snack bar. */
	duration?: number = 0;

	/** Extra CSS classes to be added to the notification container. */
	panelClass?: string | string[];

	/** Data being injected into the child component. */
	data?: any = null;

	/** The horizontal position to place the notificationr. */
	horizontalPosition?: NotificationHorizontalPosition = 'right';

	/** The vertical position to place the notification. */
	verticalPosition?: NotificationVerticalPosition = 'bottom';
}
