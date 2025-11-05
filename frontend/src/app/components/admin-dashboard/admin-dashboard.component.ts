import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCategoryComponent } from '../admin-category/admin-category.component';
import { AdminCompetitionComponent } from '../admin-competition/admin-competition.component';
import { AdminAddComponent } from '../admin-add/admin-add.component';
import { AdminParticipationComponent } from '../admin-participation/admin-participation.component';
import { JuryDashboardComponent } from '../jury-dashboard/jury-dashboard.component';
import { AdminUserComponent } from '../admin-user/admin-user.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminCategoryComponent, AdminCompetitionComponent, AdminAddComponent, AdminParticipationComponent, JuryDashboardComponent, AdminUserComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

  tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'competitions', label: 'المسابقات' },
    { id: 'categories', label: 'الفئات' },
    { id: 'participants', label: 'المتسابقون' },
    { id: 'users', label: 'المدرسون' }
  ];

  currentTab = 'overview';

  selectTab(id: string) {
    this.currentTab = id;
  }

}
