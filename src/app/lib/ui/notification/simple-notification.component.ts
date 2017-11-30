import {Component, ViewEncapsulation, Inject, ChangeDetectionStrategy} from '@angular/core';
import {trigger, style, transition, animate} from '@angular/animations';
import {AnimationCurves, AnimationDurations} from '@app/core/animation';
import {NotificationContext} from './notification-context';
import {NOTIFICATION_DATA} from './notification-config';


/**
 * A component used to open as the default snack bar, matching material spec.
 * This should only be used internally by the snack bar service.
 */
@Component({
  moduleId: module.id,
  selector: 'simple-notification',
  templateUrl: 'simple-notification.component.html',
  styleUrls: ['simple-notification.component.scss'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('contentFade', [
      transition(':enter', [
        style({opacity: '0'}),
        animate(`${AnimationDurations.COMPLEX} ${AnimationCurves.STANDARD_CURVE}`)
      ])
    ])
  ],
  host: {
    '[@contentFade]': '',
    'class': 'app-simple-notification',
  }
})
export class SimpleNotificationComponent {
  /** Data that was injected into the notification. */
  data: { message: string, action: string };

  constructor(
    public notificationContext: NotificationContext<SimpleNotificationComponent>,
    @Inject(NOTIFICATION_DATA) data: any) {
    this.data = data;
  }

  /** Performs the action on the notification. */
  action(): void {
    this.notificationContext.closeWithAction();
  }

  /** If the action button should be shown. */
  get hasAction(): boolean {
    return !!this.data.action;
  }
}
