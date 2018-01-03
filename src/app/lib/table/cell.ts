import { 
	Directive, 
	Renderer2, 
	ElementRef, 
	TemplateRef,
	Input, 
	ContentChild 
} from '@angular/core';



/**
 * Cell definition for a table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({
	selector: '[appCellTemplate]'
})
export class CellTemplateDirective {
	constructor (public template: TemplateRef<any>) { }
}



/**
 * Header cell definition for a table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({
	selector: '[appHeaderCellTemplate]'
})
export class HeaderCellTemplateDirective {
	constructor (public template: TemplateRef<any>) { }
}



/**
 * Column definition for the CDK table.
 * Defines a set of cells available for a table column.
 */
@Directive({
	selector: '[appColumnTemplate]'
})
export class ColumnTemplateDirective {

	/** Unique name for this column. */
	@Input('appColumnTemplate')
	get name(): string { return this._name; }
	set name(name: string) {
	  this._name = name;
	  this.cssClassFriendlyName = name.replace(/[^a-z0-9_-]/ig, '-');
	}
	_name: string;
  
	@ContentChild(CellTemplateDirective) cell: CellTemplateDirective;

	@ContentChild(HeaderCellTemplateDirective) headerCell: HeaderCellTemplateDirective;
  
	/**
	 * Transformed version of the column name that can be used as part of a CSS classname. Excludes
	 * all non-alphanumeric characters and the special characters '-' and '_'. Any characters that
	 * do not match are replaced by the '-' character.
	 */
	cssClassFriendlyName: string;
}



/** Header cell template container that adds the right classes and role. */
@Directive({
	selector: 'app-header-cell',
	host: {
		'class': 'app-header-cell',
		'role': 'columnheader',
	}
})
export class HeaderCellDirective {
	constructor (
		columnDef: ColumnTemplateDirective,
		elementRef: ElementRef,
		renderer: Renderer2) {
		renderer.addClass(elementRef.nativeElement, `app-column-${columnDef.cssClassFriendlyName}`);
	}
}



/** Cell template container that adds the right classes and role. */
@Directive({
	selector: 'app-cell',
	host: {
		'class': 'app-cell',
		'role': 'gridcell',
	}
})
export class CellDirective {
	constructor (
		columnTemplate: ColumnTemplateDirective,
		elementRef: ElementRef,
		renderer: Renderer2) {
		renderer.addClass(elementRef.nativeElement, `app-column-${columnTemplate.cssClassFriendlyName}`);
	}
}