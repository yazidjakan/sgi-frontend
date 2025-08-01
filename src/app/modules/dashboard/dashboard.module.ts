import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardManagerComponent } from './dashboard-manager/dashboard-manager.component';
import {AngularMaterialModule} from "../../shared/angular-material.module";
import {NgChartsModule} from "ng2-charts";


@NgModule({
  declarations: [
    DashboardComponent,
    DashboardManagerComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    AngularMaterialModule,
    NgChartsModule
  ]
})
export class DashboardModule { }
