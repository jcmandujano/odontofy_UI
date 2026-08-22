import { HttpBackend, HttpClient, HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiV1Session } from '../models/api-v1.model';
import { toUiUser } from '../models/api-v1.mapper';
import { ApiResponse } from '../models/api-response.model';
import { SessionStorageService } from '../services/session-storage.service';

const AUTH_RETRIED = new HttpContextToken<boolean>(() => false);
let refreshRequest$: Observable<ApiResponse<ApiV1Session>> | null = null;

export const interceptorFn: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionStorageService);
  const backend = inject(HttpBackend);
  const token = session.getToken();
  const isApiRequest = req.url.startsWith(environment.API_URL);
  const isSessionRequest = ['/auth/refresh', '/auth/login', '/auth/logout']
    .some(path => req.url.endsWith(path));
  const authenticatedRequest = token && isApiRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authenticatedRequest).pipe(catchError(error => {
    if (error.status !== 401 || !isApiRequest || isSessionRequest || req.context.get(AUTH_RETRIED)) {
      return throwError(() => error);
    }

    if (!refreshRequest$) {
      refreshRequest$ = new HttpClient(backend)
        .post<ApiResponse<ApiV1Session>>(`${environment.API_URL}/auth/refresh`, {}, { withCredentials: true })
        .pipe(
          tap(response => {
            if (!response.data?.accessToken) throw error;
            session.saveToken(response.data.accessToken);
            session.saveUser(toUiUser(response.data.user));
          }),
          finalize(() => { refreshRequest$ = null; }),
          shareReplay({ bufferSize: 1, refCount: false })
        );
    }

    return refreshRequest$.pipe(
      switchMap(response => next(req.clone({
        context: req.context.set(AUTH_RETRIED, true),
        setHeaders: { Authorization: `Bearer ${response.data!.accessToken}` }
      }))),
      catchError(refreshError => {
        session.signOut();
        return throwError(() => refreshError);
      })
    );
  }));
};
