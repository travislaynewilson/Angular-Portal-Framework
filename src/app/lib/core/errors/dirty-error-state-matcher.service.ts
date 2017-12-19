import { Injectable } from '@angular/core';
import { FormGroupDirective, NgForm, FormControl } from '@angular/forms';
import { ErrorStateMatcherService } from './error-state-matcher.service';



/** Error state matcher that matches when a control is invalid and dirty. */
@Injectable()
export class DirtyErrorStateMatcherService implements ErrorStateMatcherService {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		return !!(control && control.invalid && (control.dirty || (form && form.submitted)));
	}
}
