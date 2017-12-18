import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	LayoutModule,
	OverlayModule,
	PortalModule
} from '@app/cdk';
import { ButtonModule } from '../button';
import { NotificationService } from './notification.service';
import { NotificationContainerComponent } from './notification-container.component';
import { SimpleNotificationComponent } from './simple-notification.component';



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
export class NotificationModule { }
