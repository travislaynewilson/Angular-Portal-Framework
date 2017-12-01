import { Component, OnInit } from '@angular/core';
import { DialogService } from '@app/lib/ui';
import { NotFoundComponent } from '../../shared/errors';



@Component({
	selector: 'app-modals',
	templateUrl: './modals.component.html',
	styleUrls: ['./modals.component.scss']
})
export class ModalsComponent implements OnInit {

	constructor (private _dialogService: DialogService) { }

	ngOnInit () {
	}

	openDialog () {
		let context = this._dialogService.open(NotFoundComponent);
	}
}
