import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableComponent } from './table.component';
import { 
	CellOutletDirective,
	HeaderRowComponent, 
	HeaderRowColumnsDirective,
	RowColumnsDirective, 
	RowComponent 
} from './row';
import { 
	CellTemplateDirective, 
	CellDirective, 
	ColumnTemplateDirective, 
	HeaderCellTemplateDirective,
	HeaderCellDirective 
} from './cell';
import { RowPlaceholderDirective } from './row-placeholder.directive';
import { HeaderRowPlaceholderDirective } from './header-row-placeholder.directive';



const EXPORTED_DECLARATIONS = [
	CellDirective,
	CellOutletDirective,
	CellTemplateDirective,
	ColumnTemplateDirective,
	HeaderCellDirective,
	HeaderCellTemplateDirective,
	HeaderRowComponent,
	HeaderRowColumnsDirective,
	HeaderRowPlaceholderDirective,
	RowColumnsDirective,
	RowComponent,
	RowPlaceholderDirective,
	TableComponent
];

@NgModule({
	imports: [CommonModule],
	exports: [EXPORTED_DECLARATIONS],
	declarations: [EXPORTED_DECLARATIONS]

})
export class TableModule { }