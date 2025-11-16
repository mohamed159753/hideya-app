import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminAddService {

  private apiUrl = '/api/competitors'; // replace with your backend
  private baseUrl = '/api'; // adjust if needed


  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(any: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, any);
  }

  update(id: string, any: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, any);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

   // --- Participation methods ---
  getParticipations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/participations`);
  }

  registerMultiple(payload: { competitionId: string, competitorIds: string[] }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/participations/register-multiple`, payload);
  }

  deleteParticipation(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/participations/${id}`);
  }
}
