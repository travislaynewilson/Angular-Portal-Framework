import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService, AuthService, WEB_STORAGE_KEY_PREFIX } from '@app/core';



@Component({
	selector: 'app-overview',
	templateUrl: './overview.component.html',
	styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {

	users = [];
	cachedUsers = [];
	viewportSize: any;
	usersSub;

	constructor (
		private api: ApiService,
		private auth: AuthService
	) {

	}

	ngOnInit() {
		this.usersSub = this.api.getUsers().subscribe(data => {
			this.users = data;
		});
	}

	ngOnDestroy() {
		this.usersSub.unsubscribe();
	}

}
