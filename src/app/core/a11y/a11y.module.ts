import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FocusMonitorService,
  FOCUS_MONITOR_SERVICE_PROVIDER
} from './focus-monitor.service';
import {InteractivityCheckerUtility} from './interactivity-checker.utility';


@NgModule({
  imports: [
    CommonModule
  ],
  exports: [],
  declarations: [],
  providers: [
    InteractivityCheckerUtility,
    FOCUS_MONITOR_SERVICE_PROVIDER
  ]
})
export class A11yModule { }
