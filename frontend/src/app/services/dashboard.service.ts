import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalCompetitions: number;
  activeCompetitions: number;
  totalParticipants: number;
  totalJuryMembers: number;
  pendingEvaluations: number;
  completedEvaluations: number;
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
  private apiUrl = 'http://localhost:5000/api/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getRecentActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/recent-activities`);
  }
}