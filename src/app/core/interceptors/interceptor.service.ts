import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionStorageService } from '../services/session-storage.service';

export const interceptorFn: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(SessionStorageService);
  const token = tokenService.getToken();
  if (token != null) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token)
    });
    return next(authReq);
  }
  return next(req);
};