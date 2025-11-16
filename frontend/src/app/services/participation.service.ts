import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParticipationService {
  private apiUrl = '/api/participations';

  constructor(private http: HttpClient) {}

  /** 🔹 Get all participations */
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /** 🔹 Get participations by competition ID */
  getByCompetition(competitionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/competition/${competitionId}`);
  }

  /** 🔹 Get participations by competition, category and subCategory */
  getByCategory(
    competitionId: string,
    categoryId: string,
    subCategory: string
  ): Observable<any[]> {
    const params = new HttpParams()
      .set('competitionId', competitionId)
      .set('categoryId', categoryId)
      .set('subCategory', subCategory);

    // GET request with query params matching backend route
    return this.http.get<any[]>(`${this.apiUrl}/by-category`, { params });
  }

  /** 🔹 Add a new participation */
  add(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  /** 🔹 Update an existing participation */
  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  /** 🔹 Delete a participation */
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /** 🔹 Register multiple participations at once */
  registerMultiple(
    competitionId: string,
    categoryId: string,
    subCategory: string,
    competitorIds: string[]
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-multiple`, {
      competitionId,
      categoryId,
      subCategory,
      competitorIds,
    });
  }
}
