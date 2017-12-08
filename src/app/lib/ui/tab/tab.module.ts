import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ObserversModule } from '@app/core/observers';
import { PortalModule } from '@app/core/portal';
import { VIEWPORT_RULER_PROVIDER } from '@app/core/layout';
import { ScrollingModule } from '@app/core/scrolling';

import { InkBarDirective } from './ink-bar.directive';
import { TabComponent } from './tab/tab.component';
import { TabBodyComponent } from './tab-body/tab-body.component';
import { TabBodyPortalDirective } from './tab-body/tab-body-portal.directive';
import { TabGroupComponent } from './tab-group/tab-group.component';
import { TabHeaderComponent } from './tab-header/tab-header.component';
import { TabLabelDirective } from './tab-label.directive';
import { TabLabelWrapperDirective } from './tab-label-wrapper.directive';
import { TabNavComponent, TabLinkDirective } from './tab-nav/tab-nav.component';



@NgModule({
	imports: [
		CommonModule,
		PortalModule,
		ObserversModule,
		ScrollingModule
	],
	exports: [
		CommonModule,
		TabGroupComponent,
		TabLabelDirective,
		TabComponent,
		TabNavComponent,
		TabLinkDirective
	],
	declarations: [
		TabGroupComponent,
		TabLabelDirective,
		TabComponent,
		InkBarDirective,
		TabLabelWrapperDirective,
		TabNavComponent,
		TabLinkDirective,
		TabBodyComponent,
		TabBodyPortalDirective,
		TabHeaderComponent
	],
	providers: [VIEWPORT_RULER_PROVIDER]
})
export class TabModule { }
