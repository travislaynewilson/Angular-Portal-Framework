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
import { NotificationsComponent } from './notifications/notifications.component';
import { OverviewComponent } from './overview/overview.component';
import { PanelsComponent } from './panels/panels.component';
import { PreloadersComponent } from './preloaders/preloaders.component';
import { ProgressComponent } from './progress/progress.component';
import { ProgressBarsComponent } from './progress-bars/progress-bars.component';
import { RadioButtonsComponent } from './radio-buttons/radio-buttons.component';
import { SidenavsComponent } from './sidenavs/sidenavs.component';
import { SlideTogglesComponent } from './slide-toggles/slide-toggles.component';
import { SlidersComponent } from './sliders/sliders.component';
import { SteppersComponent } from './steppers/steppers.component';
import { TabsComponent } from './tabs/tabs.component';
import { ToolbarsComponent } from './toolbars/toolbars.component';
import { TooltipsComponent } from './tooltips/tooltips.component';
import { TypographyComponent } from './typography/typography.component';
import { Sub1Component } from './tabs/subtabs/sub1.component';
import { Sub2Component } from './tabs/subtabs/sub2.component';
import { AuthGuard } from '@app/core';



export const RouteCollection = [
	{ path: '', redirectTo: 'demo', pathMatch: 'full' },
	{
		path: 'demo', children: [
			{ path: '', redirectTo: 'overview', pathMatch: 'full' },
			{ path: 'overview', component: OverviewComponent },
			{ path: 'alerts', component: AlertsComponent },
			{ path: 'breadcrumbs', component: BreadcrumbsComponent },
			{ path: 'buttons', component: ButtonsComponent },
			{ path: 'checkboxes', component: CheckboxesComponent },
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
			{ path: 'radio-buttons', component: RadioButtonsComponent },
			{ path: 'sidenavs', component: SidenavsComponent },
			{ path: 'slide-toggles', component: SlideTogglesComponent },
			{ path: 'sliders', component: SlidersComponent },
			{ path: 'steppers', component: SteppersComponent },
			{
				path: 'tabs', component: TabsComponent, children: [
					{ path: 'subone', component: Sub1Component },
					{ path: 'subtwo', component: Sub2Component },
					{ path: '**', redirectTo: 'subone', pathMatch: 'full' }
				]
			},
			{ path: 'notifications', component: NotificationsComponent },
			{ path: 'toolbars', component: ToolbarsComponent },
			{ path: 'tooltips', component: TooltipsComponent },
			{ path: 'typography', component: TypographyComponent }
		]
	}
];