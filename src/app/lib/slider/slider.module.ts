import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { A11yModule, GestureConfig } from '@app/cdk';
import { SliderComponent } from './slider.component';



@NgModule({
	imports: [CommonModule, A11yModule],
	exports: [SliderComponent],
	declarations: [SliderComponent],
	providers: [{ provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }]
})
export class SliderModule { }
