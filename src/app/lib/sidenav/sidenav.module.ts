import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
	A11yModule,
	OverlayModule,
	ScrollingModule
} from '@app/cdk';
import { DrawerComponent, DrawerContainerComponent, DrawerContentComponent } from './drawer.component';
import { SidenavComponent, SidenavContainerComponent, SidenavContentComponent } from './sidenav.component';



@NgModule({
	imports: [
		CommonModule,
		A11yModule,
		OverlayModule,
		ScrollingModule
	],
	exports: [
		DrawerComponent,
		DrawerContainerComponent,
		DrawerContentComponent,
		SidenavComponent,
		SidenavContainerComponent,
		SidenavContentComponent
	],
	declarations: [
		DrawerComponent,
		DrawerContainerComponent,
		DrawerContentComponent,
		SidenavComponent,
		SidenavContainerComponent,
		SidenavContentComponent
	],
})
export class SidenavModule { }
