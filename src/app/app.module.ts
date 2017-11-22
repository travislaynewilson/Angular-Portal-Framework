import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ApiModule } from './core/api';
import { ComponentsModule } from './components/components.module';
import { LoaderModule } from './core/loader';
import { LayoutModule } from './core/layout';
import { PlatformModule } from './core/platform';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { ScrollingModule } from './core/scrolling';

import { LoaderInterceptor } from './core/loader';
import { LoggingInterceptor } from './core/logger';
import { AUTH_PROVIDERS, AuthGuard } from './core/auth';

import { UIModule } from '@app/lib/ui';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ApiModule,
    BrowserModule,
    ComponentsModule,
    HttpClientModule,
    LayoutModule,
    LoaderModule,
    RouterModule.forRoot([
      { path: '', component: AppComponent },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' }
    ]),
    PlatformModule,
    ScrollingModule,
    SharedModule,
    UIModule
  ],
  exports: [
    ScrollingModule,
    LayoutModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
    AUTH_PROVIDERS,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
