import { NgModule } from '@angular/core';
import { BreakpointObserver } from './breakpoint-observer';
import { PlatformModule } from '@app/cdk/platform';
import { MediaMatcher } from './media-matcher';
import { VIEWPORT_SERVICE_PROVIDER } from './viewport.service';



@NgModule({
	providers: [
		BreakpointObserver,
		MediaMatcher,
		VIEWPORT_SERVICE_PROVIDER
	],
	imports: [PlatformModule]
})
export class LayoutModule { }