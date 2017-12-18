import { EventEmitter, TemplateRef } from '@angular/core';
import { MenuPositionX, MenuPositionY } from './menu-positions';



export interface MenuPanel {
	xPosition: MenuPositionX;
	yPosition: MenuPositionY;
	overlapTrigger: boolean;
	templateRef: TemplateRef<any>;
	close: EventEmitter<void | 'click' | 'keydown'>;
	parentMenu?: MenuPanel | undefined;
	focusFirstItem: () => void;
	resetActiveItem: () => void;
	setPositionClasses: (x: MenuPositionX, y: MenuPositionY) => void;
	setElevation?(depth: number): void;
}
