import { Component, OnInit } from '@angular/core';
import { ApiService } from './core/services/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'app';
   api: ApiService;
   mainNavItems: object[];

  constructor(private apiService: ApiService) {
    this.api = apiService;
  }

  ngOnInit() {
    this.mainNavItems = this.api.getMainNavItems();
  }

}
