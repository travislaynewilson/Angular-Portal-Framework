import { NgModule } from '@angular/core';
import { ObserversModule } from '@app/core/observers';
import { PlatformModule } from '@app/core/platform';
import { GestureConfig } from '@app/core/gestures';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { A11yModule } from '@app/core/a11y';
import { SlideToggleComponent } from './slide-toggle.component';



@NgModule({
	imports: [
		PlatformModule,
		ObserversModule,
		A11yModule
	],
	exports: [
		SlideToggleComponent
	],
	declarations: [
		SlideToggleComponent
	],
	providers: [
		{ provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }
	]
})
export class SlideToggleModule { }