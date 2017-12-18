import { NgModule } from '@angular/core';
import { PortalDirective } from './portal.directive';
import { PortalOutletDirective } from './portal-outlet.directive';



@NgModule({
	exports: [
		PortalDirective,
		PortalOutletDirective
	],
	declarations: [
		PortalDirective,
		PortalOutletDirective
	]
})
export class PortalModule { }
