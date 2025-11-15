import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCategoryComponent } from '../admin-category/admin-category.component';
import { AdminCompetitionComponent } from '../admin-competition/admin-competition.component';
import { AdminAddComponent } from '../admin-add/admin-add.component';
import { AdminParticipationComponent } from '../admin-participation/admin-participation.component';
import { JuryDashboardComponent } from '../jury-dashboard/jury-dashboard.component';
import { AdminUserComponent } from '../admin-user/admin-user.component';
import { BranchManagementComponent } from "../branch-management/branch-management.component";
import { AgeGroupComponent } from "../../age-group/age-group.component";

// Dashboard service
import { DashboardService, DashboardStats } from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    AdminCategoryComponent, 
    AdminCompetitionComponent, 
    AdminAddComponent, 
    AdminParticipationComponent, 
    JuryDashboardComponent, 
    AdminUserComponent, 
    BranchManagementComponent, 
    AgeGroupComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'users', label: 'المدرسون' },
    { id: 'participants', label: 'المتسابقون' },
    { id: 'competitions', label: 'المسابقات' },
    { id: 'participations', label: 'المشاركات' },
    { id: 'categories', label: 'الفئات' },
    { id: 'branches', label: 'الفروع' },
    { id: 'age-groups', label: 'مجموعات الأعمار' }
  ];

  currentTab = 'overview';

  genderDistributionChart: any;
  ageGroupChart: any;
  categoryDistributionChart: any;
  branchPerformanceChart: any;
  scoreDistributionChart: any;

  // Dashboard properties
  stats: DashboardStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  selectTab(id: string) {
    this.currentTab = id;
    
    // Reload dashboard data when switching to overview
    if (id === 'overview') {
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'فشل في تحميل بيانات النظرة العامة';
        this.loading = false;
        console.error('Dashboard error:', error);
      }
    });
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  // Helper methods for progress percentages
  getCompletionPercentage(): number {
    if (!this.stats) return 0;
    const total = this.stats.completedEvaluations + this.stats.pendingEvaluations;
    return total > 0 ? (this.stats.completedEvaluations / total) * 100 : 0;
  }

  getPendingPercentage(): number {
    if (!this.stats) return 0;
    const total = this.stats.completedEvaluations + this.stats.pendingEvaluations;
    return total > 0 ? (this.stats.pendingEvaluations / total) * 100 : 0;
  }

  
}