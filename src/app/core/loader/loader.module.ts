import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './loader.component';
import { LoaderService } from './loader.service';

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
    LoaderService
  ]
})
export class LoaderModule { }
