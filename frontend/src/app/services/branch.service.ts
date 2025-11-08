import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private apiUrl = 'http://localhost:5000/api/branches';

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
