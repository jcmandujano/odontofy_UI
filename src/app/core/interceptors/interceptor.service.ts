import { HttpBackend, HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { SessionStorageService } from '../services/session-storage.service';
import { environment } from '../../../environments/environment';

export const interceptorFn: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(SessionStorageService);
  const httpBackend = inject(HttpBackend);
  const token = tokenService.getToken();
  const isApiRequest = req.url.startsWith(environment.API_URL);
  const isSessionRequest = req.url.endsWith('/auth/refresh') || req.url.endsWith('/auth/login') || req.url.endsWith('/auth/logout');
  const authReq = token != null && isApiRequest ? req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token)
    }) : req;
  return next(authReq).pipe(catchError((error) => {
    if (error.status !== 401 || !isApiRequest || isSessionRequest) return throwError(() => error);
    return new HttpClient(httpBackend).post<any>(`${environment.API_URL}/auth/refresh`, {}, { withCredentials: true }).pipe(
      switchMap((response) => {
        const refreshedToken = response.data?.token;
        if (!refreshedToken) return throwError(() => error);
        tokenService.saveToken(refreshedToken);
        tokenService.saveUser(response.data.user);
        return next(req.clone({ headers: req.headers.set('Authorization', `Bearer ${refreshedToken}`) }));
      }),
      catchError(() => {
        tokenService.signOut();
        return throwError(() => error);
      })
    );
  }));
};
