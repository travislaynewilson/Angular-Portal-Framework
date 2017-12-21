import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { RouteCollection } from "./login.routing";
import { LoginComponent } from "./login/login.component";
import { SharedModule } from "@app/shared";



@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild(RouteCollection)
	],
	exports: [
		RouterModule
	],
	declarations: [
		LoginComponent
	]
})
export class LoginModule {}