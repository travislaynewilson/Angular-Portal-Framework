import { NgModule } from '@angular/core';
import { CardBodyDirective } from './card-body.directive';
import { CardFooterDirective } from './card-footer.directive';
import { CardHeaderComponent } from './card-header.component';
import { CardTitleDirective } from './card-title.directive';
import { CardComponent } from './card.component';



@NgModule({
	imports: [],
	exports: [
		CardBodyDirective,
		CardFooterDirective,
		CardHeaderComponent,
		CardTitleDirective,
		CardComponent
	],
	declarations: [
		CardBodyDirective,
		CardFooterDirective,
		CardHeaderComponent,
		CardTitleDirective,
		CardComponent
	]
})
export class CardModule { }
