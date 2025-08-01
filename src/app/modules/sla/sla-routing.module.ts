import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SlaComponent } from './sla.component';

const routes: Routes = [{ path: '', component: SlaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SlaRoutingModule { }
