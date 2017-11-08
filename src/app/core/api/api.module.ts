import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XHRBackend, RequestOptions } from '@angular/http';

import { ApiService } from './api.service';
import { LoaderModule } from '../loader';

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
