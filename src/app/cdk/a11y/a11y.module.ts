import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusMonitorService, FOCUS_MONITOR_SERVICE_PROVIDER } from './focus-monitor.service';
import { TrapFocusDirective } from './trap-focus.directive';
import { FocusTrapFactory } from './focus-trap.factory';
import { InteractivityCheckerUtility } from './interactivity-checker.utility';



@NgModule({
	imports: [
		CommonModule
	],
	exports: [TrapFocusDirective],
	declarations: [TrapFocusDirective],
	providers: [
		InteractivityCheckerUtility,
		FocusTrapFactory,
		FOCUS_MONITOR_SERVICE_PROVIDER
	]
})
export class A11yModule { }
