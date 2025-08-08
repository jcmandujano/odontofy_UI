import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

const AUTH_API = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private api: ApiService) { }

  login(username: string, password: string): Observable<any> {
    return this.api.post<any>(`${AUTH_API}/auth/login`, {
      username,
      password
    });
  }

  register(payload: any): Observable<any> {
    return this.api.post<any>(`${AUTH_API}/auth/register`, payload);
  }

  verifyPassword(password: string): Observable<any> {
    return this.api.post<any>(`${AUTH_API}/auth/verify-password`, {
      password
    });
  }
}
