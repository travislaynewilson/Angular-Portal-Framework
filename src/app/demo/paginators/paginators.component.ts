import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent, PaginatorComponent } from '@app/lib';



@Component({
	selector: 'app-paginators',
	templateUrl: './paginators.component.html',
	styleUrls: ['./paginators.component.scss']
})
export class PaginatorsComponent implements OnInit {

	@ViewChild('paginator') paginator: PaginatorComponent;

	constructor () { }

	ngOnInit() {
	}

	// Paginator inputs
	length = 100;
	pageSize = 10;
	pageSizeOptions = [5, 10, 25, 100];

	// Paginator output
	pageEvent: PageEvent;

	setPageSizeOptions(setPageSizeOptionsInput: string) {
		this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
	}

	emitPageEvent(): void {
		this.paginator.emitPageEvent();
	}
}
