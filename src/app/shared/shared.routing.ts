import {
	ForbiddenComponent,
	InternalServerErrorComponent,
	NotFoundComponent,
	UnauthorizedComponent
} from './errors';


export const RouteCollection = [
	{
		path: 'error', children: [
			{ path: '', redirectTo: '500', pathMatch: 'full' },
			{ path: '401', component: UnauthorizedComponent },
			{ path: '403', component: ForbiddenComponent },
			{ path: '404', component: NotFoundComponent },
			{ path: '500', component: InternalServerErrorComponent }
		]
	}
];