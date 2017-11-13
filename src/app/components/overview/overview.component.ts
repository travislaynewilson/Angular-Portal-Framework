import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../core/api';

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

  constructor(
    private api: ApiService
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
