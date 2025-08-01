import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PredictionRoutingModule } from './prediction-routing.module';
import { PredictionComponent } from './prediction.component';
import { PredictionDashboardComponent } from './prediction-dashboard/prediction-dashboard.component';


@NgModule({
  declarations: [
    PredictionComponent,
    PredictionDashboardComponent
  ],
  imports: [
    CommonModule,
    PredictionRoutingModule
  ]
})
export class PredictionModule { }
