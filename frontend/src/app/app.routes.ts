import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminAddComponent } from './components/admin-add/admin-add.component';
import { AdminCompetitionComponent } from './components/admin-competition/admin-competition.component';
import { AdminCategoryComponent } from './components/admin-category/admin-category.component';
import { AdminParticipationComponent } from './components/admin-participation/admin-participation.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./components/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },
  {
    path: 'jury-dashboard',
    loadComponent: () =>
      import('./components/jury-dashboard/jury-dashboard.component').then(
        (m) => m.JuryDashboardComponent
      ),
  },
  { path:'competitor',component:AdminAddComponent},
  { path:'competition',component:AdminCompetitionComponent},
  { path:'category',component:AdminCategoryComponent},
  { path:'participation',component:AdminParticipationComponent},

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
  
];
