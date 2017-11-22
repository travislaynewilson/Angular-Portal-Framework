import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FocusMonitorService,
  FOCUS_MONITOR_SERVICE_PROVIDER
} from './focus-monitor.service';


@NgModule({
  imports: [
    CommonModule
  ],
  exports: [],
  declarations: [],
  providers: [
    FOCUS_MONITOR_SERVICE_PROVIDER
  ]
})
export class A11yModule { }
