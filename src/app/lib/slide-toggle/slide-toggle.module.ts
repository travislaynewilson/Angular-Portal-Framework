import { NgModule } from '@angular/core';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {
	A11yModule,
	GestureConfig,
	ObserversModule,
	PlatformModule
} from '@app/cdk';
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