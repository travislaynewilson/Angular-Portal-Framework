import { AppComponent } from './app.component';



export const RouteCollection = [
	//{ path: '', component: AppComponent },
	{ path: '', redirectTo: '/demo', pathMatch: 'full' },
	{ path: '**', redirectTo: 'error/404', pathMatch: 'full' }
];