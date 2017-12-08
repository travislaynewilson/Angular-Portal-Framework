import { AlertsComponent } from './alerts/alerts.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ButtonsComponent } from './buttons/buttons.component';
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
import { SlidersComponent } from './sliders/sliders.component';
import { SteppersComponent } from './steppers/steppers.component';
import { TabsComponent } from './tabs/tabs.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ToolbarsComponent } from './toolbars/toolbars.component';
import { TooltipsComponent } from './tooltips/tooltips.component';
import { TypographyComponent } from './typography/typography.component';
import { Sub1Component } from '@app/components/tabs/subtabs/sub1.component';
import { Sub2Component } from '@app/components/tabs/subtabs/sub2.component';
 
export const RouteCollection = [
	{ path: '', redirectTo: 'overview', pathMatch: 'full' },
	{ path: 'overview', component: OverviewComponent },
	{ path: 'alerts', component: AlertsComponent },
	{ path: 'breadcrumbs', component: BreadcrumbsComponent },
	{ path: 'buttons', component: ButtonsComponent },
	{ path: 'datatables', component: DatatablesComponent },
	{ path: 'datepickers', component: DatepickersComponent },
	{ path: 'dialogs', component: DialogsComponent },
	{ path: 'error-pages', component: ErrorPagesComponent },
	{ path: 'forms', component: FormsComponent },
	{ path: 'grid', component: GridComponent },
	{ path: 'input-groups', component: InputGroupsComponent },
	{ path: 'lists', component: ListsComponent },
	{ path: 'menus', component: MenusComponent },
	{ path: 'panels', component: PanelsComponent },
	{ path: 'preloaders', component: PreloadersComponent },
	{ path: 'progress-bars', component: ProgressBarsComponent },
	{ path: 'sliders', component: SlidersComponent },
	{ path: 'steppers', component: SteppersComponent },
	{ path: 'tabs', component: TabsComponent, children: [
		{ path: 'sub1', component: Sub1Component, outlet: 'tabsubs' },
		{ path: 'sub2', component: Sub2Component, outlet: 'tabsubs' }
	]},
	{ path: 'notifications', component: NotificationsComponent },
	{ path: 'toolbars', component: ToolbarsComponent },
	{ path: 'tooltips', component: TooltipsComponent },
	{ path: 'typography', component: TypographyComponent }
];