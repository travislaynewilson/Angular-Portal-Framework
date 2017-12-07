import { Component, OnInit } from '@angular/core';
import { ApiService } from './core/api';



@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	title: string = 'app';
	api: ApiService;
	mainNavItems: object[];

	mainMenuLinks: object[] = [
		{ text: "Overview", icon: "home", route: '/overview' },
		{ text: "Alerts", icon: "error_outline", route: '/alerts' },
		{ text: "Breadcrumbs", icon: "history", route: '/breadcrumbs' },
		{ text: "Buttons", icon: "crop_7_5", route: '/buttons' },
		{ text: "Datatables", icon: "border_all", route: '/datatables' },
		{ text: "Date Range Pickers", icon: "date_range", route: '/date-range-pickers' },
		{ text: "Dialogs", icon: "aspect_ratio", route: '/dialogs' },
		{ text: "Error Pages", icon: "error", route: '/error-pages' },
		{ text: "Forms", icon: "storage", route: '/forms' },
		{ text: "Grid", icon: "line_style", route: '/grid' },
		{ text: "Input Groups", icon: "flip", route: '/input-groups' },
		{ text: "Lists", icon: "format_list_bulleted", route: '/lists' },
		{ text: "Menus", icon: "filter_frames", route: '/menus' },
		{ text: "Notifications", icon: "notifications_none", route: '/notifications' },
		{ text: "Panels", icon: "view_day", route: '/panels' },
		{ text: "Preloaders", icon: "timelapse", route: '/preloaders' },
		{ text: "Progress Bars", icon: "hourglass_empty", route: '/progress-bars' },
		{ text: "Sliders", icon: "tune", route: '/sliders' },
		{ text: "Steppers", icon: "linear_scale", route: '/steppers' },
		{ text: "Tabs", icon: "tab", route: '/tabs' },
		{ text: "Toolbars", icon: "space_bar", route: '/toolbars' },
		{ text: "Tooltips", icon: "live_help", route: '/tooltips' },
		{ text: "Typography", icon: "text_fields", route: '/typography' }
	];

	constructor (private apiService: ApiService) {
		this.api = apiService;
	}

	ngOnInit () {

	}
}