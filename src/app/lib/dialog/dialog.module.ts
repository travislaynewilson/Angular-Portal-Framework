import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule, OverlayModule, PortalModule } from '@app/cdk';
import { DialogService } from './dialog.service';
import { DIALOG_SCROLL_STRATEGY_PROVIDER } from './dialog-scroll.strategy';
import { DialogContainerComponent } from './dialog-container.component';
import { DialogActionsDirective } from './dialog-actions.directive';
import { DialogCloseDirective } from './dialog-close.directive';
import { DialogContentDirective } from './dialog-content.directive';
import { DialogTitleDirective } from './dialog-title.directive';



@NgModule({
	imports: [
		CommonModule,
		OverlayModule,
		PortalModule,
		A11yModule
	],
	exports: [
		DialogContainerComponent,
		DialogCloseDirective,
		DialogTitleDirective,
		DialogContentDirective,
		DialogActionsDirective
	],
	declarations: [
		DialogContainerComponent,
		DialogCloseDirective,
		DialogTitleDirective,
		DialogContentDirective,
		DialogActionsDirective
	],
	providers: [
		DialogService,
		DIALOG_SCROLL_STRATEGY_PROVIDER
	],
	entryComponents: [DialogContainerComponent]
})
export class DialogModule { }
