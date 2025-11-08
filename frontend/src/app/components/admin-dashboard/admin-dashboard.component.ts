import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCategoryComponent } from '../admin-category/admin-category.component';
import { AdminCompetitionComponent } from '../admin-competition/admin-competition.component';
import { AdminAddComponent } from '../admin-add/admin-add.component';
import { AdminParticipationComponent } from '../admin-participation/admin-participation.component';
import { JuryDashboardComponent } from '../jury-dashboard/jury-dashboard.component';
import { AdminUserComponent } from '../admin-user/admin-user.component';
import { BranchManagementComponent } from "../branch-management/branch-management.component";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminCategoryComponent, AdminCompetitionComponent, AdminAddComponent, AdminParticipationComponent, JuryDashboardComponent, AdminUserComponent, BranchManagementComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

  tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'users', label: 'المدرسون' },
    { id: 'participants', label: 'المتسابقون' },
    { id: 'competitions', label: 'المسابقات' },
    { id: 'participations', label: 'المشاركات' },
    { id: 'categories', label: 'الفئات' },
    { id: 'branches', label: 'الفروع' },
    
  ];

  currentTab = 'overview';

  selectTab(id: string) {
    this.currentTab = id;
  }

}
