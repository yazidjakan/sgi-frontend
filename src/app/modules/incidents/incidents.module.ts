import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IncidentsRoutingModule } from './incidents-routing.module';
import { IncidentsComponent } from './incidents.component';
import { IncidentListComponent } from './incident-list/incident-list.component';
import { IncidentCreateComponent } from './incident-create/incident-create.component';
import { IncidentDetailComponent } from './incident-detail/incident-detail.component';
import {AngularMaterialModule} from "../../shared/angular-material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    IncidentsComponent,
    IncidentListComponent,
    IncidentCreateComponent,
    IncidentDetailComponent
  ],
  imports: [
    CommonModule,
    IncidentsRoutingModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class IncidentsModule { }
