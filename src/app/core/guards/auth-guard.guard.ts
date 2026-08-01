import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { SessionStorageService } from '../services/session-storage.service';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private storage: SessionStorageService, private auth: AuthService, private router: Router) { }

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    if (this.storage.getToken()) {
      return true;
    }
    return this.auth.refresh().pipe(
      map((response) => {
        if (!response.data?.token) throw new Error('No active session');
        this.storage.saveToken(response.data.token);
        this.storage.saveUser(response.data.user);
        return true;
      }),
      catchError(() => {
        this.storage.signOut();
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      })
    );
  }
}
