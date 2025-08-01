import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncidentsComponent } from './incidents.component';

const routes: Routes = [{ path: '', component: IncidentsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncidentsRoutingModule { }
