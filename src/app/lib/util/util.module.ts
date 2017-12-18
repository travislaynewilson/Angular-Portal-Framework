import { NgModule } from '@angular/core';
import { PaddedDirective } from './padding/padded.directive';
import { PaddedBottomDirective } from './padding/padded-bottom.directive';
import { PaddedLeftDirective } from './padding/padded-left.directive';
import { PaddedRightDirective } from './padding/padded-right.directive';
import { PaddedTopDirective } from './padding/padded-top.directive';
import { PaddedXDirective } from './padding/padded-x.directive';
import { PaddedYDirective } from './padding/padded-y.directive';



@NgModule({
	imports: [],
	exports: [
		PaddedDirective,
		PaddedBottomDirective,
		PaddedLeftDirective,
		PaddedRightDirective,
		PaddedTopDirective,
		PaddedXDirective,
		PaddedYDirective
	],
	declarations: [
		PaddedDirective,
		PaddedBottomDirective,
		PaddedLeftDirective,
		PaddedRightDirective,
		PaddedTopDirective,
		PaddedXDirective,
		PaddedYDirective
	]
})
export class UtilModule { }