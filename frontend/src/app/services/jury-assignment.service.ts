import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface IJuryMember { userId: string; role: 'member' | 'president'; }
export interface IJuryAssignment {
  _id?: string;
  competitionId: string;
  categoryId: string;
  classRoom?: string;
  juryMembers: IJuryMember[];
}

@Injectable({ providedIn: 'root' })
export class JuryAssignmentService {
  private apiUrl = 'http://localhost:5000/api/jury-assignments';
  constructor(private http: HttpClient) {}

  getByCompetition(competitionId: string): Observable<IJuryAssignment[]> {
    return this.http.get<IJuryAssignment[]>(`${this.apiUrl}?competitionId=${competitionId}`);
  }

  getByUser(userId: string) {
    return this.http.get<IJuryAssignment[]>(`${this.apiUrl}/user/${userId}`);
  }

  create(payload: Partial<IJuryAssignment>) {
    return this.http.post<IJuryAssignment>(this.apiUrl, payload);
  }

  update(id: string, payload: Partial<IJuryAssignment>) {
    return this.http.put<IJuryAssignment>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
