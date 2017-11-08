import {NgModule} from '@angular/core';
import {PlatformModule} from '../platform';
import {BreakpointObserver} from './breakpoint-observer';
import {MediaMatcher} from './media-matcher';

@NgModule({
  providers: [BreakpointObserver, MediaMatcher],
  imports: [PlatformModule]
})
export class LayoutModule {}