import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PseudoCheckboxModule } from '../selection/index';
import { OptionComponent } from './option.component';
import { OptgroupComponent } from './optgroup.component';



@NgModule({
	imports: [CommonModule, PseudoCheckboxModule],
	exports: [OptionComponent, OptgroupComponent],
	declarations: [OptionComponent, OptgroupComponent]
})
export class OptionModule { }