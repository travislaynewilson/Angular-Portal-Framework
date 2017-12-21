import { LoginComponent } from "./login/login.component";
import { PublicLayoutComponent } from "@app/shared";



export const RouteCollection = [
	{ path: '', component: PublicLayoutComponent, children: [
		{ path: '', redirectTo: 'login', pathMatch: 'full' },
		{ path: 'login', component: LoginComponent }
	]}
];