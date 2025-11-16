import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgeGroupService {

  private apiUrl = `${environment.apiUrl}/api/age-groups`;
  
    constructor(private http: HttpClient) {}
  
    getAgeGroups(): Observable<any> {
      return this.http.get(this.apiUrl);
    }
  
    addAgeGroup(name: string, from:number,to:number): Observable<any> {
      return this.http.post(this.apiUrl, { name,  from, to });
    }
  
    deleteAgeGroup(id: string): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
