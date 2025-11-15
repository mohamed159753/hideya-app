import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminAddComponent } from './components/admin-add/admin-add.component';
import { AdminCompetitionComponent } from './components/admin-competition/admin-competition.component';
import { AdminCategoryComponent } from './components/admin-category/admin-category.component';
import { AdminParticipationComponent } from './components/admin-participation/admin-participation.component';
import { JuryResultsComponent } from './components/jury-results/jury-results.component';
import { AgeGroupComponent } from './age-group/age-group.component';
import { CompetitionCategoryConfigComponent } from './components/competition-category-config/competition-category-config.component';
import { ResultsComponent } from './components/results/results.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { JuryDashboardComponent } from './components/jury-dashboard/jury-dashboard.component';
import { BranchManagementComponent } from './components/branch-management/branch-management.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,canActivate: [AuthGuard],
    data: { role: 'admin' },
  },
  {
    path: 'jury-dashboard',
    component: JuryDashboardComponent,canActivate: [AuthGuard],
    data: { role: 'jury' },
  },
  {
    path: 'results/:id',
    component: ResultsComponent,
    canActivate: [AuthGuard],
    data: { role: 'jury' },
  },
  { path: 'competitor', component: AdminAddComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' }
   },
  { path: 'competition', component: AdminCompetitionComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' }
   },
  { path: 'category', component: AdminCategoryComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' }
   },
  { path: 'participation', component: AdminParticipationComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' }
   },
  { path: 'jury-results', component: JuryResultsComponent,
    canActivate: [AuthGuard],
    data: { role: 'jury' }
   },

  {
    path: 'branch-management',
    component: BranchManagementComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' },
  },
  { path: 'age-group-management', component: AgeGroupComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' }
   },
  {
    path: 'admin/competitions/:id/configure',
    component: CompetitionCategoryConfigComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' },
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
