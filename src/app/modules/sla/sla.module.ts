import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlaRoutingModule } from './sla-routing.module';
import { SlaComponent } from './sla.component';
import { SlaDashboardComponent } from './sla-dashboard/sla-dashboard.component';


@NgModule({
  declarations: [
    SlaComponent,
    SlaDashboardComponent
  ],
  imports: [
    CommonModule,
    SlaRoutingModule
  ]
})
export class SlaModule { }
