import {NgModule} from '@angular/core';
import {BreakpointObserver} from './breakpoint-observer';
import {PlatformModule} from '@app/core/platform';
import {MediaMatcher} from './media-matcher';
import {VIEWPORT_RULER_PROVIDER} from './viewport-ruler';

@NgModule({
  providers: [
    BreakpointObserver, 
    MediaMatcher,
    VIEWPORT_RULER_PROVIDER
  ],
  imports: [PlatformModule]
})
export class LayoutModule {}