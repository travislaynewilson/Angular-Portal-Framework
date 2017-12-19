import { Injectable } from '@angular/core';
import { FormGroupDirective, NgForm, FormControl } from '@angular/forms';



/** Provider that defines how form controls behave with regards to displaying error messages. */
@Injectable()
export class ErrorStateMatcherService {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		return !!(control && control.invalid && (control.touched || (form && form.submitted)));
	}
}
