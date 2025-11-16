import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminResultsService {
  private apiUrl = '/api/admin/results';

  constructor(private http: HttpClient) {}

  /**
   * Get all results (admin only)
   */
  getAllResults(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Get results filtered by competition, category, and subcategory
   */
  getFilteredResults(
    competitionId?: string,
    categoryId?: string,
    subCategory?: string
  ): Observable<any[]> {
    let params = new HttpParams();
    if (competitionId) params = params.set('competitionId', competitionId);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (subCategory) params = params.set('subCategory', subCategory);

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  /**
   * Get a single result by ID
   */
  getResultById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete a result
   */
  deleteResult(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Export results to Excel/CSV
   */
  exportResults(
    competitionId?: string,
    categoryId?: string,
    subCategory?: string
  ): Observable<Blob> {
    let params = new HttpParams();
    if (competitionId) params = params.set('competitionId', competitionId);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (subCategory) params = params.set('subCategory', subCategory);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Export a single result
   */
  exportSingleResult(id: string, format: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  /**
   * Get statistics for admin dashboard
   */
  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  /**
   * Get results by competition
   */
  getResultsByCompetition(competitionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/competition/${competitionId}`);
  }

  /**
   * Get results by category
   */
  getResultsByCategory(categoryId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  /**
   * Compare multiple results
   */
  compareResults(resultIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/compare`, { resultIds });
  }

  /**
   * Get result history for a specific competition/category
   */
  getResultHistory(
    competitionId: string,
    categoryId: string,
    subCategory?: string
  ): Observable<any[]> {
    let params = new HttpParams()
      .set('competitionId', competitionId)
      .set('categoryId', categoryId);
    
    if (subCategory) params = params.set('subCategory', subCategory);

    return this.http.get<any[]>(`${this.apiUrl}/history`, { params });
  }
}