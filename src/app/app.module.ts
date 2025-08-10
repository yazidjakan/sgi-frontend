import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

// CDK Modules
import { DragDropModule } from '@angular/cdk/drag-drop';

// Third-party Modules
import { ToastrModule } from 'ngx-toastr';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KanbanComponent } from './components/kanban/kanban.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ReportsComponent } from './components/reports/reports.component';
import { PredictionsComponent } from './components/predictions/predictions.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Manager', 'Admin système'] }
  },
  { 
    path: 'tickets', 
    component: KanbanComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'tickets/create', 
    component: KanbanComponent, // TODO: Create TicketComponent
    canActivate: [AuthGuard] 
  },
  { 
    path: 'assigned-tickets', 
    component: KanbanComponent, // TODO: Create AssignedTicketsComponent
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Technicien'] }
  },
  { 
    path: 'users', 
    component: DashboardComponent, // TODO: Create UsersComponent
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin système'] }
  },
  { 
    path: 'sla', 
    component: DashboardComponent, // TODO: Create SLAComponent
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Manager', 'Admin système'] }
  },
  { 
    path: 'performance', 
    component: DashboardComponent, // TODO: Create PerformanceComponent
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Manager', 'Admin système'] }
  },
  { 
    path: 'reports', 
    component: ReportsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Manager', 'Admin système'] }
  },
  { 
    path: 'technicians', 
    component: DashboardComponent, // TODO: Create TechniciansComponent
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Manager', 'Admin système'] }
  },
  { 
    path: 'system', 
    component: DashboardComponent, // TODO: Create SystemComponent
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin système'] }
  },
  { 
    path: 'search', 
    component: DashboardComponent, // TODO: Create SearchComponent
    canActivate: [AuthGuard] 
  },
  { 
    path: 'help', 
    component: DashboardComponent, // TODO: Create HelpComponent
    canActivate: [AuthGuard] 
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    KanbanComponent,
    NotificationsComponent,
    ReportsComponent,
    PredictionsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    
    // Angular Material
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatRadioModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    
    // CDK
    DragDropModule,
    
    // Third-party
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
