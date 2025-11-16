import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private apiUrl = `${environment.apiUrl}/api/jury-results`;

  constructor(private http: HttpClient, private notify: NotificationService) {}

  // Check permission: all marks submitted or president override
  check(competitionId: string, categoryId: string, requestedBy?: string): Observable<any> {
    let params = new HttpParams().set('competitionId', competitionId).set('categoryId', categoryId);
    if (requestedBy) params = params.set('requestedBy', requestedBy);
    return this.http.get<any>(`${this.apiUrl}/can-show-results`, { params }).pipe(
      catchError((err) => {
        const msg = err?.error?.message || 'فشل التحقق من إمكانية عرض النتائج';
        this.notify.error(msg);
        return throwError(() => err);
      })
    );
  }

  // Preview computed final results (read-only)
  getFinalResults(competitionId: string, categoryId: string, subCategoryId:string): Observable<any> {
    const params = new HttpParams().set('competitionId', competitionId).set('categoryId', categoryId).set('subCategory',subCategoryId);
    return this.http.get<any>(`${this.apiUrl}/final-results`, { params }).pipe(
      catchError((err) => {
        const msg = err?.error?.message || 'فشل جلب النتائج النهائية';
        this.notify.error(msg);
        return throwError(() => err);
      })
    );
  }

  // Save final results to DB for audit trail
  saveFinalResults(payload: { competitionId: string; categoryId: string; subCategory : string; requestedBy?: string; note?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save-final-results`, payload).pipe(
      catchError((err) => {
        const msg = err?.error?.message || 'فشل حفظ النتائج النهائية';
        this.notify.error(msg);
        return throwError(() => err);
      })
    );
  }

  // Get saved result by id
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        const msg = err?.error?.message || 'فشل جلب النتيجة';
        this.notify.error(msg);
        return throwError(() => err);
      })
    );
  }
}
