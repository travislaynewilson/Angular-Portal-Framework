import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from './services/services';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [],
  providers: [ApiService]
})
export class CoreModule { }
