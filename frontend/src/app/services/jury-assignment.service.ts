import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

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
  constructor(private http: HttpClient, private notify: NotificationService) {}

  getByCompetition(competitionId: string): Observable<IJuryAssignment[]> {
    return this.http.get<IJuryAssignment[]>(`${this.apiUrl}?competitionId=${competitionId}`);
}

  getByUser(userId: string) {
    return this.http.get<IJuryAssignment[]>(`${this.apiUrl}/user/${userId}`);
  }

  create(payload: Partial<IJuryAssignment>) {
    return this.http.post<IJuryAssignment>(this.apiUrl, payload).pipe(
      catchError((err) => {
        const serverMsg = err?.error?.message || '';
        let msg = 'فشل إنشاء التعيين';
        if (serverMsg) {
          if (serverMsg.includes('classroom') || serverMsg.includes('classRoom') || serverMsg.includes('already assigned')) {
            msg = 'هذه القاعة مخصصة بالفعل لفئة أخرى في نفس المسابقة';
          } else if (serverMsg.includes('president')) {
            msg = 'يجب اختيار رئيس واحد بالضبط';
          } else {
            msg = serverMsg;
          }
        }
        this.notify.error(msg);
        return throwError(() => err);
      })
    );
  }

  update(id: string, payload: Partial<IJuryAssignment>) {
    return this.http.put<IJuryAssignment>(`${this.apiUrl}/${id}`, payload).pipe(
      catchError((err) => {
        const serverMsg = err?.error?.message || '';
        let msg = 'فشل تحديث التعيين';
        if (serverMsg) {
          if (serverMsg.includes('classroom') || serverMsg.includes('classRoom') || serverMsg.includes('already assigned')) {
            msg = 'هذه القاعة مخصصة بالفعل لفئة أخرى في نفس المسابقة';
          } else if (serverMsg.includes('president')) {
            msg = 'يجب اختيار رئيس واحد بالضبط';
          } else {
            msg = serverMsg;
          }
        }
        this.notify.error(msg);
        return throwError(() => err);
      })
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
