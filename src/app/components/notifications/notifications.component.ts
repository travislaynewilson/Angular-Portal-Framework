import { Component, OnInit } from '@angular/core';
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

  horizontalPosition: NotificationHorizontalPosition = 'center';
  verticalPosition: NotificationVerticalPosition = 'bottom';
  duration?: number = 3000;

  constructor(private _notificationService: NotificationService) { }

  ngOnInit() {
  }

  notify() {
    var notification = this._notificationService.open(`Hello world!`, 'Action', {
      duration: this.duration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition
    });

    notification.onAction().subscribe(() => {
      this.timestamp = new Date();
    });
  }

}
