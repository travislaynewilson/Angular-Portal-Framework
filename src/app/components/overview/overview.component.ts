import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  users = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getUsers().subscribe(data => {
      this.users = data;
    }) 
  }

}
