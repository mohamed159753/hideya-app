import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private apiUrl = `${environment.apiUrl}/api/branches`;

  constructor(private http: HttpClient) {}

  getBranches(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addBranch(name: string): Observable<any> {
    return this.http.post(this.apiUrl, { name });
  }

  deleteBranch(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
