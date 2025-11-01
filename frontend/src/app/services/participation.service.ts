import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParticipationService {
  private apiUrl = 'http://localhost:5000/api/participations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getByCompetition(competitionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/competition/${competitionId}`);
  }

  add(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Updated to include categoryId
  registerMultiple(competitionId: string, categoryId: string, competitorIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-multiple`, { competitionId, categoryId, competitorIds });
  }
}
