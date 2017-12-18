import { Directive } from '@angular/core';



@Directive({
	selector: 'app-card-title, [appCardTitle]',
	host: {
		'class': 'card-title'
	}
})
export class CardTitleDirective { }