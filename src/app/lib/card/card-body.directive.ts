import { Directive, Input } from '@angular/core';
import { CoercionHelper } from '@app/cdk/helpers';



@Directive({
	selector: 'app-card-body, [appCardBody]',
	host: {
		'class': 'card-body'
	}
})
export class CardBodyDirective { }