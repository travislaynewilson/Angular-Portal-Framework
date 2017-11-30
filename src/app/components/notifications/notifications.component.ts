import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { 
  NotificationService, 
  NotificationConfig,
  NotificationHorizontalPosition, 
  NotificationVerticalPosition 
} from '@app/lib/ui';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  timestamp: Date;

  message: string = 'Hello world!';
  horizontalPosition: NotificationHorizontalPosition = 'center';
  verticalPosition: NotificationVerticalPosition = 'bottom';
  duration?: number = 3000;

  constructor(
    private _notificationService: NotificationService,
    private _viewContainerRef: ViewContainerRef) { }

  ngOnInit() {
  }

  notify() {
    var notification = this._notificationService.open(this.message, 'Action', {
      viewContainerRef: this._viewContainerRef,
      duration: this.duration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition
    });

    notification.onAction().subscribe(() => {
      this.timestamp = new Date();
    });
  }

}
