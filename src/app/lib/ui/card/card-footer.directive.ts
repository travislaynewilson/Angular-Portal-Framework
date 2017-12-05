import { Directive } from '@angular/core';



@Directive({
	selector: 'app-card-footer, [appCardFooter]',
	host: {
		'class': 'card-footer'
	}
})
export class CardFooterDirective {}