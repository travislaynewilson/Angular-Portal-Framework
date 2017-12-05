import { Directive, Input } from '@angular/core';
import {CoercionHelper} from '@app/core/util';



@Directive({
	selector: 'app-card-body, [appCardBody]',
	host: {
		'class': 'card-body'
	}
})
export class CardBodyDirective {}