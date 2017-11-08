import {NgModule} from '@angular/core';
import {SCROLL_DISPATCHER_PROVIDER} from './scroll-dispatcher';
import {ScrollableDirective} from  './scrollable';
import {PlatformModule} from '../platform';

@NgModule({
  imports: [PlatformModule],
  exports: [ScrollableDirective],
  declarations: [ScrollableDirective],
  providers: [SCROLL_DISPATCHER_PROVIDER]
})
export class ScrollingModule {}