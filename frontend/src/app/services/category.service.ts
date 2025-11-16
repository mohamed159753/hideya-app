import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

     private apiUrl = `${environment.apiUrl}/api/categories`; // replace with your backend
  
  
    constructor(private http: HttpClient) { }
  
     getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
      }

      add(category:any): Observable<any> {
        return this.http.post<any>(this.apiUrl, category);
      }

      update(id: string, any: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, any);
  }

    delete(id: string): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
