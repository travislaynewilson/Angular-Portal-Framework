import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UNIQUE_SELECTION_DISPATCHER_SERVICE_PROVIDER } from '@app/core/collections';
import { AccordionModule } from '@app/core/accordion';
import { A11yModule } from '@app/core/a11y';

import { BaseExpansionPanelComponent } from './base-expansion-panel.component'
import { ExpansionPanelAccordionDirective } from './expansion-panel-accordion.directive';
import { ExpansionPanelActionRowDirective } from './expansion-panel-action-row.directive'
import { ExpansionPanelDescriptionDirective } from './expansion-panel-description.directive'
import { ExpansionPanelHeaderComponent } from './expansion-panel-header.component';
import { ExpansionPanelTitleDirective } from './expansion-panel-title.directive';
import { ExpansionPanelComponent } from './expansion-panel.component';


@NgModule({
	imports: [
		CommonModule,
		A11yModule,
		AccordionModule
	],
	exports: [
		BaseExpansionPanelComponent,
		ExpansionPanelAccordionDirective,
		ExpansionPanelActionRowDirective,
		ExpansionPanelDescriptionDirective,
		ExpansionPanelHeaderComponent,
		ExpansionPanelTitleDirective,
		ExpansionPanelComponent
	],
	declarations: [
		BaseExpansionPanelComponent,
		ExpansionPanelAccordionDirective,
		ExpansionPanelActionRowDirective,
		ExpansionPanelDescriptionDirective,
		ExpansionPanelHeaderComponent,
		ExpansionPanelTitleDirective,
		ExpansionPanelComponent
	],
	providers: [UNIQUE_SELECTION_DISPATCHER_SERVICE_PROVIDER]
})
export class ExpansionPanelModule { }
