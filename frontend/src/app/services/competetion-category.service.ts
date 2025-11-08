import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ICompetitionCategory {
  _id?: string;
  competitionId: string;
  categoryId: string;
  ageGroupId: string;
  gender: 'male' | 'female';
  label?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompetitionCategoryService {
  private apiUrl = 'http://localhost:5000/api/competition-categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ICompetitionCategory[]> {
    return this.http.get<ICompetitionCategory[]>(this.apiUrl);
  }

  getByCompetition(competitionId: string): Observable<ICompetitionCategory[]> {
    return this.http.get<ICompetitionCategory[]>(`${this.apiUrl}/competition/${competitionId}`);
  }

  getById(id: string): Observable<ICompetitionCategory> {
    return this.http.get<ICompetitionCategory>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<ICompetitionCategory>): Observable<ICompetitionCategory> {
    return this.http.post<ICompetitionCategory>(this.apiUrl, data);
  } 

  update(id: string, data: Partial<ICompetitionCategory>): Observable<ICompetitionCategory> {
    return this.http.put<ICompetitionCategory>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}