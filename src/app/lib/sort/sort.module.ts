import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortHeaderComponent } from './sort-header.component';
import { SortableDirective } from './sortable.directive';



@NgModule({
	imports: [CommonModule],
	exports: [SortableDirective, SortHeaderComponent],
	declarations: [SortableDirective, SortHeaderComponent]
})
export class SortModule { }
