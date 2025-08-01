import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import {AngularMaterialModule} from "../../shared/angular-material.module";
import {FormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    AdminComponent,
    UserListComponent,
    UserFormComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    AngularMaterialModule,
    FormsModule
  ]
})
export class AdminModule { }
