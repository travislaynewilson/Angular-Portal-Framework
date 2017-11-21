import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UIModule } from '../lib/ui';

import { 
  ForbiddenComponent,
  InternalServerErrorComponent,
  NotFoundComponent, 
  UnauthorizedComponent
} from './errors';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot([
      { path: 'error', children: [
        { path: '', redirectTo: '500', pathMatch: 'full' },
        { path: '401', component: UnauthorizedComponent },
        { path: '403', component: ForbiddenComponent },
        { path: '404', component: NotFoundComponent },
        { path: '500', component: InternalServerErrorComponent }
      ]}
    ]),
    UIModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    NotFoundComponent, 
    ForbiddenComponent, 
    UnauthorizedComponent,
    InternalServerErrorComponent
  ]
})
export class SharedModule { }
