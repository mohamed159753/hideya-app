import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MarkService {
  private apiUrl = `${environment.apiUrl}/api/marks`;

  // inject NotificationService via DI
  constructor(private http: HttpClient, private notify: NotificationService) {}

  upsert(markPayload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upsert`, markPayload).pipe(
      catchError((err) => {
        const serverMsg = err?.error?.message || '';
        let msg = 'فشل حفظ العلامة';
        if (serverMsg) {
          if (serverMsg.includes('confirmed') || serverMsg.includes('locked')) {
            msg = 'تم تأكيد الورقة بالفعل ولا يمكن تعديل العلامات';
          } else if (
            serverMsg.includes('participation') &&
            serverMsg.includes('not found')
          ) {
            msg = 'المشاركة غير موجودة';
          } else {
            msg = serverMsg;
          }
        }
        this.notify.error(msg);
        return throwError(() => err);
      })
    );
  }

  getByParticipation(participationId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/participation/${participationId}`
    );
  }

  getByJuryAndParticipation(
    juryId: string,
    participationId: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('juryId', juryId)
      .set('participationId', participationId);
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      catchError((err) => {
        const serverMsg = err?.error?.message || '';
        let msg = 'فشل جلب العلامة';
        if (serverMsg) {
          if (err?.status === 404) {
            msg = 'لم يتم العثور على علامة لهذه المشاركة';
          } else {
            msg = serverMsg;
          }
        }
        this.notify.error(msg);
        return throwError(() => err);
      })
    );
  }

  aggregateByCategory(
    competitionId: string,
    categoryId: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('competitionId', competitionId)
      .set('categoryId', categoryId);
    return this.http.get<any>(`${this.apiUrl}/aggregate`, { params });
  }

  // NEW METHODS FOR RESULTS FEATURE
  canShowResults(competitionId: string, categoryId: string): Observable<any> {
    return this.http
      .get<any>(
        `${this.apiUrl}/can-show-results/${competitionId}/${categoryId}`
      )
      .pipe(
        catchError((err) => {
          const serverMsg = err?.error?.message || '';
          let msg = 'فشل التحقق من إمكانية عرض النتائج';
          if (serverMsg) {
            msg = serverMsg;
          }
          this.notify.error(msg);
          return throwError(() => err);
        })
      );
  }

  getFinalResults(competitionId: string, categoryId: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/final-results/${competitionId}/${categoryId}`)
      .pipe(
        catchError((err) => {
          const serverMsg = err?.error?.message || '';
          let msg = 'فشل جلب النتائج النهائية';
          if (serverMsg) {
            msg = serverMsg;
          }
          this.notify.error(msg);
          return throwError(() => err);
        })
      );
  }

  saveFinalResults(resultsData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/save-final-results`, resultsData)
      .pipe(
        catchError((err) => {
          const serverMsg = err?.error?.message || '';
          let msg = 'فشل حفظ النتائج النهائية';
          if (serverMsg) {
            msg = serverMsg;
          }
          this.notify.error(msg);
          return throwError(() => err);
        })
      );
  }

  // Additional helper method to get marks by competition and category
  getMarksByCompetitionCategory(
    competitionId: string,
    categoryId: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('competitionId', competitionId)
      .set('categoryId', categoryId);
    return this.http
      .get<any>(`${this.apiUrl}/competition-category`, { params })
      .pipe(
        catchError((err) => {
          const serverMsg = err?.error?.message || '';
          let msg = 'فشل جلب العلامات للمسابقة والفئة';
          if (serverMsg) {
            msg = serverMsg;
          }
          this.notify.error(msg);
          return throwError(() => err);
        })
      );
  }
}
