import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface Competition {
  _id?: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  categoryIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {

    private apiUrl = `${environment.apiUrl}/api/competitions`; // replace with your backend


  constructor(private http: HttpClient) { }

   getAll(): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl);
    }

    add(competition:Competition): Observable<any> {
      return this.http.post<any>(this.apiUrl, competition);
    }

      getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }


  update(id: string, any: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, any);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
