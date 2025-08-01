import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: 'auth', loadChildren: () => import('./modules/auth/modules/auth.module').then(m => m.AuthModule) },
  { path: 'incidents', loadChildren: () => import('./modules/incidents/incidents.module').then(m => m.IncidentsModule) }, { path: 'dashboard', loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },
  { path: 'sla-monitoring', loadChildren: () => import('./modules/sla/sla.module').then(m => m.SlaModule) },
  { path: 'prediction', loadChildren: () => import('./modules/prediction/prediction.module').then(m => m.PredictionModule) },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'incidents',
    loadChildren: () => import('./modules/incidents/incidents.module').then(m => m.IncidentsModule)
  },
  {
    path: 'sla-monitoring',
    loadChildren: () => import('./modules/sla/sla.module').then(m => m.SlaModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'prediction',
    loadChildren: () => import('./modules/prediction/prediction.module').then(m => m.PredictionModule)
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
