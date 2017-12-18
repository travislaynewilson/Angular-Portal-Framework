import { NgModule } from '@angular/core';
import { PlatformModule } from '@app/cdk/platform';
import { SCROLL_DISPATCHER_SERVICE_PROVIDER } from './scroll-dispatcher.service';
import { ScrollableDirective } from './scrollable.directive';



@NgModule({
	imports: [PlatformModule],
	exports: [ScrollableDirective],
	declarations: [ScrollableDirective],
	providers: [SCROLL_DISPATCHER_SERVICE_PROVIDER]
})
export class ScrollingModule { }