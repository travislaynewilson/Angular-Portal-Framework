import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UNIQUE_SELECTION_DISPATCHER_SERVICE_PROVIDER } from '@app/core/collections';
import { AccordionModule } from '@app/core/accordion';
import { A11yModule } from '@app/core/a11y';

import { BasePanelComponent } from './base-panel.component'
import { PanelGroupDirective } from './panel-group.directive';
import { PanelActionsDirective } from './panel-actions.directive'
import { PanelDescriptionDirective } from './panel-description.directive'
import { PanelHeaderComponent } from './panel-header.component';
import { PanelTitleDirective } from './panel-title.directive';
import { PanelComponent } from './panel.component';


@NgModule({
	imports: [
		CommonModule,
		A11yModule,
		AccordionModule
	],
	exports: [
		BasePanelComponent,
		PanelActionsDirective,
		PanelComponent,
		PanelDescriptionDirective,
		PanelGroupDirective,
		PanelHeaderComponent,
		PanelTitleDirective
	],
	declarations: [
		BasePanelComponent,
		PanelActionsDirective,
		PanelComponent,
		PanelDescriptionDirective,
		PanelGroupDirective,
		PanelHeaderComponent,
		PanelTitleDirective
	],
	providers: [UNIQUE_SELECTION_DISPATCHER_SERVICE_PROVIDER]
})
export class PanelModule { }
