import { NgModule } from '@angular/core';
import { ObserveContentDirective } from './observe-content.directive';
import { MutationObserverFactory } from './mutation-observer.factory'



@NgModule({
	exports: [ObserveContentDirective],
	declarations: [ObserveContentDirective],
	providers: [MutationObserverFactory]
})
export class ObserversModule { }
