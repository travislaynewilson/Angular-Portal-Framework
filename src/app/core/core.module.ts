import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XHRBackend, RequestOptions } from '@angular/http';

import { ApiService } from './api';
import { LoaderComponent, LoaderService } from './loader';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    LoaderComponent
  ],
  declarations: [
    LoaderComponent
  ],
  providers: [
    ApiService,
    LoaderService
  ]
})
export class CoreModule { }
