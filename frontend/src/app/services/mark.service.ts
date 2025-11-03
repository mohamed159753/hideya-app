import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class MarkService {
  private apiUrl = 'http://localhost:5000/api/marks';

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
          } else if (serverMsg.includes('participation') && serverMsg.includes('not found')) {
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
    return this.http.get<any[]>(`${this.apiUrl}/participation/${participationId}`);
  }

  getByJuryAndParticipation(juryId: string, participationId: string): Observable<any> {
    const params = new HttpParams().set('juryId', juryId).set('participationId', participationId);
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

  aggregateByCategory(competitionId: string, categoryId: string): Observable<any> {
    const params = new HttpParams().set('competitionId', competitionId).set('categoryId', categoryId);
    return this.http.get<any>(`${this.apiUrl}/aggregate`, { params });
  }
}
