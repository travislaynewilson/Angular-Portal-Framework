import { LoginComponent } from "./login/login.component";
import { PublicLayoutComponent } from "@app/shared";
import { AnonymousGuard } from "@app/core";



export const RouteCollection = [
	{ path: '', component: PublicLayoutComponent, children: [
		{ path: '', redirectTo: 'login', pathMatch: 'full' },
		{ path: 'login', canActivate: [AnonymousGuard], component: LoginComponent }
	]}
];