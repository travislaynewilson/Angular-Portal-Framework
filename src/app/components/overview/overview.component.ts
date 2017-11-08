import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  users = [];
  viewportSize: any;

  constructor(
    private api: ApiService
  ) {

   }

  ngOnInit() {
    this.api.getUsers().subscribe(data => {
      this.users = data;
    }) 
  }

}
