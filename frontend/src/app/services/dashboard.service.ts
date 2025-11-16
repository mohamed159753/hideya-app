import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  // Basic Stats
  totalCompetitions: number;
  activeCompetitions: number;
  totalParticipants: number;
  totalJuryMembers: number;
  pendingEvaluations: number;
  completedEvaluations: number;
  
  // Extended Stats
  totalBranches: number;
  totalCategories: number;
  totalAgeGroups: number;
  
  // Gender Distribution
  genderDistribution: {
    male: number;
    female: number;
  };
  
  // Age Group Distribution
  ageGroupDistribution: { name: string; count: number }[];
  
  // Category Distribution
  categoryDistribution: { name: string; count: number }[];
  
  // Branch Performance
  branchPerformance: { name: string; participants: number; averageScore: number }[];
  
  // Score Distribution
  scoreDistribution: { range: string; count: number }[];
  
  // Recent Activities
  recentActivities: Activity[];
  competitionProgress: CompetitionProgress[];
}

export interface Activity {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  competition: string;
}

export interface CompetitionProgress {
  competitionId: string;
  competitionTitle: string;
  totalParticipants: number;
  evaluatedParticipants: number;
  progressPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getGenderStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gender-stats`);
  }

  getScoreDistribution(): Observable<any> {
    return this.http.get(`${this.apiUrl}/score-distribution`);
  }
}