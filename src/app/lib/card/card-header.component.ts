import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';



@Component({
	selector: 'app-card-header',
	exportAs: 'appCardHeader',
	templateUrl: './card-header.component.html',
	styleUrls: ['./card-header.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'class': 'card-header'
	}
})
export class CardHeaderComponent { }