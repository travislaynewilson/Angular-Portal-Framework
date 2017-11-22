import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XHRBackend, RequestOptions } from '@angular/http';

import { LoaderModule } from '@app/core/loader';
import { ApiService } from './api.service';

@NgModule({
  imports: [
    CommonModule,
    LoaderModule
  ],
  providers: [
    ApiService
  ]
})
export class ApiModule { }
