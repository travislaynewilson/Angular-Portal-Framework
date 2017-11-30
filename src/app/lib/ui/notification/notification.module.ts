import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@app/core/overlay';
import {PortalModule} from '@app/core/portal';
import {LayoutModule} from '@app/core/layout';
import {ButtonModule} from '../button';

import {NotificationService} from './notification.service';
import {NotificationContainerComponent} from './notification-container.component';
import {SimpleNotificationComponent} from './simple-notification.component';


@NgModule({
  imports: [
	ButtonModule,
    OverlayModule,
    PortalModule, 
    CommonModule,
    LayoutModule
  ],
  exports: [NotificationContainerComponent],
  declarations: [NotificationContainerComponent, SimpleNotificationComponent],
  entryComponents: [NotificationContainerComponent, SimpleNotificationComponent],
  providers: [NotificationService]
})
export class NotificationModule {}
