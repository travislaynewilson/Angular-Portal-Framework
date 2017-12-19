import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';



@Component({
	selector: 'app-forms',
	templateUrl: './forms.component.html',
	styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit {

	$email = new FormControl('', [
		Validators.required,
		Validators.email
	]);

	query: string;

	constructor () { }

	ngOnInit() {
	}

}
