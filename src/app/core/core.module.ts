import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import {RouterOutlet} from "@angular/router";
import {AngularMaterialModule} from "../shared/angular-material.module";



@NgModule({
  declarations: [
    MainLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    AngularMaterialModule
  ]
})
export class CoreModule { }
