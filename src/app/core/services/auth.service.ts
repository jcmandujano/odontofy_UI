import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiV1Session } from '../models/api-v1.model';
import { toDate, toUiUser } from '../models/api-v1.mapper';
import { ApiResponse, mapApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';
import { ApiService } from './api.service';

export interface UiSession {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) { }

  login(email: string, password: string): Observable<ApiResponse<UiSession>> {
    return this.session(this.api.post<ApiV1Session>('/auth/login', { email, password }));
  }

  register(payload: {
    name?: string;
    middle_name?: string;
    last_name?: string;
    date_of_birth?: Date;
    phone?: string;
    avatar?: string;
    email?: string;
    password?: string;
  }) {
    return this.api.post<null>('/auth/register', {
      name: payload.name,
      middleName: payload.middle_name ?? '',
      lastName: payload.last_name,
      dateOfBirth: toDate(payload.date_of_birth) ?? undefined,
      phone: payload.phone ?? '',
      avatar: payload.avatar ?? '',
      email: payload.email,
      password: payload.password
    });
  }

  verifyPassword(password: string) {
    return this.api.post<{ valid: true }>('/auth/password/verify', { password });
  }

  forgotPassword(email: string) {
    return this.api.post<null>('/auth/password/forgot', { email });
  }

  requestAccountVerification(email: string) {
    return this.api.post<null>('/auth/account-verification/request', { email });
  }

  confirmAccount(userId: number, token: string) {
    return this.api.post<null>('/auth/account-verification/confirm', { userId, token });
  }

  resetPassword(token: string, newPassword: string) {
    return this.api.post<null>('/auth/password/reset', { token, password: newPassword });
  }

  refresh(): Observable<ApiResponse<UiSession>> {
    return this.session(this.api.post<ApiV1Session>('/auth/refresh', {}));
  }

  logout() {
    return this.api.post<null>('/auth/logout', {});
  }

  private session(source: Observable<ApiResponse<ApiV1Session>>): Observable<ApiResponse<UiSession>> {
    return source.pipe(map(response => mapApiResponse(response, value => ({
      token: value.accessToken,
      user: toUiUser(value.user)
    }))));
  }
}
