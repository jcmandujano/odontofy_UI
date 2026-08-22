import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SessionStorageService } from '../services/session-storage.service';
import { AuthGuard } from './auth-guard.guard';

describe('AuthGuard', () => {
  it('allows navigation when an access token is already in memory', () => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: SessionStorageService, useValue: { getToken: () => 'token' } },
        { provide: AuthService, useValue: {} },
        { provide: Router, useValue: {} }
      ]
    });

    const result = TestBed.inject(AuthGuard).canActivate({} as never, {} as never);
    expect(result).toBeTrue();
  });
});
