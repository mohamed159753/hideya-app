import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminAddComponent } from './components/admin-add/admin-add.component';
import { AdminCompetitionComponent } from './components/admin-competition/admin-competition.component';
import { AdminCategoryComponent } from './components/admin-category/admin-category.component';
import { AdminParticipationComponent } from './components/admin-participation/admin-participation.component';
<<<<<<< HEAD
import { JuryResultsComponent } from './components/jury-results/jury-results.component';
=======
import { AgeGroupComponent } from './age-group/age-group.component';
import { CompetitionCategoryConfigComponent } from './components/competition-category-config/competition-category-config.component';
>>>>>>> 88cb8e141ee2f66b6b865b699e7c1c0734bfb611

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
  {
    path: 'results/:id',
    loadComponent: () =>
      import('./components/results/results.component').then((m) => m.ResultsComponent),
  },
  { path:'competitor',component:AdminAddComponent},
  { path:'competition',component:AdminCompetitionComponent},
  { path:'category',component:AdminCategoryComponent},
  { path:'participation',component:AdminParticipationComponent},
<<<<<<< HEAD
  { path: 'jury-results', component:JuryResultsComponent },

=======
  { path:'branch-management', loadComponent: () => import('./components/branch-management/branch-management.component').then(m => m.BranchManagementComponent)},
  { path:'age-group-management',component:AgeGroupComponent},
  { path: 'admin/competitions/:id/configure', component:CompetitionCategoryConfigComponent},
>>>>>>> 88cb8e141ee2f66b6b865b699e7c1c0734bfb611
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
  
];
