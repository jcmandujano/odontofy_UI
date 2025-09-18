import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionStorageService } from '../services/session-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private storage: SessionStorageService, private router: Router) { }

  canActivate(): boolean {
    if (this.storage.getToken()) {
      return true;
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
}
