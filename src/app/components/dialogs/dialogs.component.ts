import { Component, OnInit } from '@angular/core';
import { DialogService } from '@app/lib/ui';
import { DialogDemoComponent } from './dialog-demo/dialog-demo.component';



@Component({
	selector: 'app-dialogs',
	templateUrl: './dialogs.component.html',
	styleUrls: ['./dialogs.component.scss']
})
export class DialogsComponent implements OnInit {

	constructor (private _dialogService: DialogService) { }

	ngOnInit () {
	}

	openDialog () {
		let context = this._dialogService.open(DialogDemoComponent);
	}
}
