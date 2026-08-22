import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-confirm-account',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './confirm-account.component.html',
  styleUrl: './confirm-account.component.scss'
})
export class ConfirmAccountComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  message = 'Estamos confirmando tu cuenta.';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.queryParamMap.get('userId'));
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!Number.isInteger(userId) || userId <= 0 || !/^[a-f0-9]{64}$/.test(token)) {
      this.status = 'error';
      this.message = 'El enlace de confirmacion no es valido.';
      return;
    }

    this.authService.confirmAccount(userId, token).subscribe({
      next: () => {
        this.status = 'success';
        this.message = 'Tu cuenta fue confirmada correctamente.';
      },
      error: () => {
        this.status = 'error';
        this.message = 'El enlace no es valido o ya vencio.';
      }
    });
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }
}
