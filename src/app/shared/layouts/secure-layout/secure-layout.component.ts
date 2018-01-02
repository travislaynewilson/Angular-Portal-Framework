import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AuthService, User } from '@app/core';
import { BreakpointObserver, Breakpoints } from '@app/cdk';
import { SidenavComponent } from '@app/lib';



@Component({
	selector: 'app-secure-layout',
	templateUrl: './secure-layout.component.html',
	styleUrls: ['./secure-layout.component.scss']
})
export class SecureLayoutComponent implements OnInit {

	@ViewChild("appDrawer") sidenav: SidenavComponent;

	isPhoneBreakpoint: boolean;

	breakpointObserverSubscription: Subscription;

	user: User | null = null;

	mainNavItems: object[];

	mainMenuLinks: object[] = [
		{ text: "Overview", icon: "home", route: '/demo/overview' },
		{ text: "Alerts", icon: "error_outline", route: '/demo/alerts' },
		{ text: "Breadcrumbs", icon: "history", route: '/demo/breadcrumbs' },
		{ text: "Buttons", icon: "crop_7_5", route: '/demo/buttons' },
		{ text: "Checkboxes", icon: "check_box", route: '/demo/checkboxes' },
		{ text: "Datatables", icon: "border_all", route: '/demo/datatables' },
		{ text: "Datepickers", icon: "date_range", route: '/demo/datepickers' },
		{ text: "Dialogs", icon: "aspect_ratio", route: '/demo/dialogs' },
		{ text: "Error Pages", icon: "error", route: '/demo/error-pages' },
		{ text: "Forms", icon: "storage", route: '/demo/forms' },
		{ text: "Grid", icon: "line_style", route: '/demo/grid' },
		{ text: "Input Groups", icon: "flip", route: '/demo/input-groups' },
		{ text: "Lists", icon: "format_list_bulleted", route: '/demo/lists' },
		{ text: "Menus", icon: "filter_frames", route: '/demo/menus' },
		{ text: "Notifications", icon: "notifications_none", route: '/demo/notifications' },
		{ text: "Panels", icon: "view_day", route: '/demo/panels' },
		{ text: "Preloaders", icon: "timelapse", route: '/demo/preloaders' },
		{ text: "Progress Bars", icon: "hourglass_empty", route: '/demo/progress-bars' },
		{ text: "Radio Buttons", icon: "radio_button_checked", route: '/demo/radio-buttons' },
		{ text: "Sidenavs", icon: "menu", route: '/demo/sidenavs' },
		{ text: "Slide Toggles", icon: "hdr_strong", route: '/demo/slide-toggles' },
		{ text: "Sliders", icon: "tune", route: '/demo/sliders' },
		{ text: "Steppers", icon: "linear_scale", route: '/demo/steppers' },
		{ text: "Tabs", icon: "tab", route: '/demo/tabs' },
		{ text: "Toolbars", icon: "space_bar", route: '/demo/toolbars' },
		{ text: "Tooltips", icon: "live_help", route: '/demo/tooltips' },
		{ text: "Typography", icon: "text_fields", route: '/demo/typography' }
	];

	constructor (
		private auth: AuthService,
		private breakpointObserver: BreakpointObserver,
		private changeDetectorRef: ChangeDetectorRef,
		private router: Router
	) {
		this.auth.authenticated.subscribe((e) => {
			this.user = e.user;

			if(!e.authenticated) {
				this.auth.navigateToLogin();
			}
		});
	}

	ngAfterContentInit() {
		/**
		 * Subscribe to the breakpoint observer to know when to force toggle the 
		 * app sidenav.
		 */
		this.breakpointObserverSubscription = this.breakpointObserver.observe(Breakpoints.Phone).subscribe(state => {
			this.isPhoneBreakpoint = state.matches;

			if (this.isPhoneBreakpoint) {
				this.sidenav.close();
				this.sidenav.mode = 'over';
			} else {
				this.sidenav.open();
				this.sidenav.mode = 'side';
			}

			this.changeDetectorRef.markForCheck();
		});
	}

	ngOnDestroy() {
		if (this.breakpointObserverSubscription) {
			this.breakpointObserverSubscription.unsubscribe();
		}
	}

	ngOnInit() {

	}

	closeSidenav(): void {
		if (!this.isPhoneBreakpoint) return;

		this.sidenav.close();
	}

	logout(): void {
		this.auth.logout();
	}
}
