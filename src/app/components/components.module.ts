import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule }   from '@angular/router';
import { UIModule } from '@app/lib/ui';

import { RouteCollection } from './components.routing';

import { AlertsComponent } from './alerts/alerts.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { CheckboxesComponent } from './checkboxes/checkboxes.component';
import { DatatablesComponent } from './datatables/datatables.component';
import { DatepickersComponent } from './datepickers/datepickers.component';
import { DialogsComponent } from './dialogs/dialogs.component';
import { DialogDemoComponent } from './dialogs/dialog-demo/dialog-demo.component';
import { ErrorPagesComponent } from './error-pages/error-pages.component';
import { FormsComponent } from './forms/forms.component';
import { GridComponent } from './grid/grid.component';
import { InputGroupsComponent } from './input-groups/input-groups.component';
import { ListsComponent } from './lists/lists.component';
import { MenusComponent } from './menus/menus.component';
import { OverviewComponent } from './overview/overview.component';
import { PanelsComponent } from './panels/panels.component';
import { PreloadersComponent } from './preloaders/preloaders.component';
import { ProgressComponent } from './progress/progress.component';
import { ProgressBarsComponent } from './progress-bars/progress-bars.component';
import { SlideTogglesComponent } from './slide-toggles/slide-toggles.component';
import { SlidersComponent } from './sliders/sliders.component';
import { SteppersComponent } from './steppers/steppers.component';
import { TabsComponent } from './tabs/tabs.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ToolbarsComponent } from './toolbars/toolbars.component';
import { TooltipsComponent } from './tooltips/tooltips.component';
import { TypographyComponent } from './typography/typography.component';
import { Sub1Component } from './tabs/subtabs/sub1.component';
import { Sub2Component } from './tabs/subtabs/sub2.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(RouteCollection),
    UIModule
  ],
  declarations: [
    AlertsComponent, 
    BreadcrumbsComponent, 
	ButtonsComponent, 
	CheckboxesComponent,
    DatatablesComponent, 
    DatepickersComponent, 
	DialogsComponent, 
	DialogDemoComponent,
    ErrorPagesComponent,
    FormsComponent, 
    GridComponent, 
    InputGroupsComponent, 
    ListsComponent, 
    MenusComponent, 
    NotificationsComponent, 
    OverviewComponent,
    PanelsComponent, 
    PreloadersComponent, 
    ProgressComponent, 
	ProgressBarsComponent,
	SlideTogglesComponent,
    SlidersComponent,
	SteppersComponent, 
	Sub1Component, 
	Sub2Component,
    TabsComponent, 
    ToolbarsComponent, 
    TooltipsComponent, 
    TypographyComponent
  ],
  entryComponents: [
	DialogDemoComponent
  ]
})
export class ComponentsModule { }
