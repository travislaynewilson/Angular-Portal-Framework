import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {HTTP_INTERCEPTORS} from '@angular/common/http';

import { CoreModule } from './core/core.module';
import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';

import { LoaderInterceptor } from './core/loader';
import { LoggingInterceptor } from './core/logger';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CoreModule,
    ComponentsModule,
    RouterModule.forRoot([
      { path: '', component: AppComponent }
    ]),
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
