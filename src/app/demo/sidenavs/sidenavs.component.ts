import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-sidenavs',
	templateUrl: './sidenavs.component.html',
	styleUrls: ['./sidenavs.component.scss']
})
export class SidenavsComponent implements OnInit {

	mode: 'push' | 'over' | 'side' = 'side';
	carddrawermode:  'push' | 'over' | 'side' = 'side';

	constructor () { }

	ngOnInit() {
	}

}
