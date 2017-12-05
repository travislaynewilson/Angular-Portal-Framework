import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';



@Component({
	selector: 'app-card',
	exportAs: 'appCard',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.scss'],
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'class': 'card'
	}
})
export class CardComponent {}