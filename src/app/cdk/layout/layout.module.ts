import { NgModule } from '@angular/core';
import { BreakpointObserver } from './breakpoint-observer';
import { PlatformModule } from '@app/cdk/platform';
import { MediaMatcherService } from './media-matcher.service';
import { VIEWPORT_SERVICE_PROVIDER } from './viewport.service';



@NgModule({
	providers: [
		BreakpointObserver,
		MediaMatcherService,
		VIEWPORT_SERVICE_PROVIDER
	],
	imports: [PlatformModule]
})
export class LayoutModule { }