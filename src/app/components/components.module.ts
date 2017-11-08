import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule }   from '@angular/router';

import { AlertsComponent } from './alerts/alerts.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { DatatablesComponent } from './datatables/datatables.component';
import { DateRangePickersComponent } from './date-range-pickers/date-range-pickers.component';
import { DropdownsComponent } from './dropdowns/dropdowns.component';
import { ErrorPagesComponent } from './error-pages/error-pages.component';
import { FormsComponent } from './forms/forms.component';
import { GridComponent } from './grid/grid.component';
import { InputGroupsComponent } from './input-groups/input-groups.component';
import { ListsComponent } from './lists/lists.component';
import { ModalsComponent } from './modals/modals.component';
import { OverviewComponent } from './overview/overview.component';
import { PanelsComponent } from './panels/panels.component';
import { PreloadersComponent } from './preloaders/preloaders.component';
import { ProgressComponent } from './progress/progress.component';
import { SteppersComponent } from './steppers/steppers.component';
import { TabsComponent } from './tabs/tabs.component';
import { ToastsComponent } from './toasts/toasts.component';
import { ToolbarsComponent } from './toolbars/toolbars.component';
import { TooltipsComponent } from './tooltips/tooltips.component';
import { TypographyComponent } from './typography/typography.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'alerts', component: AlertsComponent },
      { path: 'breadcrumbs', component: BreadcrumbsComponent },
      { path: 'buttons', component: ButtonsComponent },
      { path: 'datatables', component: DatatablesComponent },
      { path: 'date-range-pickers', component: DateRangePickersComponent },
      { path: 'dropdowns', component: DropdownsComponent },
      { path: 'error-pages', component: ErrorPagesComponent },
      { path: 'forms', component: FormsComponent },
      { path: 'grid', component: GridComponent },
      { path: 'input-groups', component: InputGroupsComponent },
      { path: 'lists', component: ListsComponent },
      { path: 'modals', component: ModalsComponent },
      { path: 'panels', component: PanelsComponent },
      { path: 'preloaders', component: PreloadersComponent },
      { path: 'progress', component: ProgressComponent },
      { path: 'steppers', component: SteppersComponent },
      { path: 'tabs', component: TabsComponent },
      { path: 'toasts', component: ToastsComponent },
      { path: 'toolbars', component: ToolbarsComponent },
      { path: 'tooltips', component: TooltipsComponent },
      { path: 'typography', component: TypographyComponent }
    ])
  ],
  declarations: [
    AlertsComponent, 
    BreadcrumbsComponent, 
    ButtonsComponent, 
    DatatablesComponent, 
    DateRangePickersComponent, 
    DropdownsComponent, 
    ErrorPagesComponent,
    FormsComponent, 
    GridComponent, 
    InputGroupsComponent, 
    ListsComponent, 
    ModalsComponent, 
    OverviewComponent,
    PanelsComponent, 
    PreloadersComponent, 
    ProgressComponent, 
    SteppersComponent, 
    TabsComponent, 
    ToastsComponent, 
    ToolbarsComponent, 
    TooltipsComponent, 
    TypographyComponent
  ]
})
export class ComponentsModule { }
