import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule }   from '@angular/router';

import { UIModule } from '@app/lib/ui';

import { AlertsComponent } from './alerts/alerts.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { DatatablesComponent } from './datatables/datatables.component';
import { DateRangePickersComponent } from './date-range-pickers/date-range-pickers.component';
import { ErrorPagesComponent } from './error-pages/error-pages.component';
import { FormsComponent } from './forms/forms.component';
import { GridComponent } from './grid/grid.component';
import { InputGroupsComponent } from './input-groups/input-groups.component';
import { ListsComponent } from './lists/lists.component';
import { MenusComponent } from './menus/menus.component';
import { ModalsComponent } from './modals/modals.component';
import { OverviewComponent } from './overview/overview.component';
import { PanelsComponent } from './panels/panels.component';
import { PreloadersComponent } from './preloaders/preloaders.component';
import { ProgressComponent } from './progress/progress.component';
import { ProgressBarsComponent } from './progress-bars/progress-bars.component';
import { SteppersComponent } from './steppers/steppers.component';
import { TabsComponent } from './tabs/tabs.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ToolbarsComponent } from './toolbars/toolbars.component';
import { TooltipsComponent } from './tooltips/tooltips.component';
import { TypographyComponent } from './typography/typography.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'alerts', component: AlertsComponent },
      { path: 'breadcrumbs', component: BreadcrumbsComponent },
      { path: 'buttons', component: ButtonsComponent },
      { path: 'datatables', component: DatatablesComponent },
      { path: 'date-range-pickers', component: DateRangePickersComponent },
      { path: 'error-pages', component: ErrorPagesComponent },
      { path: 'forms', component: FormsComponent },
      { path: 'grid', component: GridComponent },
      { path: 'input-groups', component: InputGroupsComponent },
      { path: 'lists', component: ListsComponent },
      { path: 'menus', component: MenusComponent },
      { path: 'modals', component: ModalsComponent },
      { path: 'panels', component: PanelsComponent },
      { path: 'preloaders', component: PreloadersComponent },
      { path: 'progress-bars', component: ProgressBarsComponent },
      { path: 'steppers', component: SteppersComponent },
      { path: 'tabs', component: TabsComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'toolbars', component: ToolbarsComponent },
      { path: 'tooltips', component: TooltipsComponent },
      { path: 'typography', component: TypographyComponent }
    ]),
    UIModule
  ],
  declarations: [
    AlertsComponent, 
    BreadcrumbsComponent, 
    ButtonsComponent, 
    DatatablesComponent, 
    DateRangePickersComponent, 
    ErrorPagesComponent,
    FormsComponent, 
    GridComponent, 
    InputGroupsComponent, 
    ListsComponent, 
    MenusComponent, 
    ModalsComponent, 
    OverviewComponent,
    PanelsComponent, 
    PreloadersComponent, 
    ProgressComponent, 
    ProgressBarsComponent,
    SteppersComponent, 
    TabsComponent, 
    NotificationsComponent, 
    ToolbarsComponent, 
    TooltipsComponent, 
    TypographyComponent
  ]
})
export class ComponentsModule { }
