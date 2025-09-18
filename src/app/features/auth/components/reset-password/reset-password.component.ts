import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../../../core/services/auth.service';
import { PrivacyTermsComponent } from '../../../../shared/dialogs/privacy-terms/privacy-terms.component';
import { TermsConditionsComponent } from '../../../../shared/dialogs/terms-conditions/terms-conditions.component';
import { passwordMatchValidator } from '../../../../core/validators/password-match.directive';

@Component({
  selector: 'app-reset-password',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterModule,
    NgxSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  uid!: string;
  token!: string;
  resetPasswordForm!: FormGroup;
  constructor(private router: Router, private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public authService: AuthService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.uid = params['uid'];
      this.token = params['token'];
      console.log('UID:', this.uid);
      console.log('TOKEN:', this.token);
    });
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }


  resetPassword() {
    this.resetPasswordForm.markAllAsTouched();
    console.log(this.resetPasswordForm);
    if (this.resetPasswordForm.valid) {
      this.spinner.show();
      const { newPassword, confirmPassword } = this.resetPasswordForm.value;
      if (newPassword !== confirmPassword) {
        this.spinner.hide();
        this.openSnackbar('Las contraseñas no coinciden', 'Cerrar');
        return;
      }
      this.authService.resetPassword(this.token, newPassword!).subscribe({
        next: (res) => {
          console.log(res);
          const msg = res.data;
          this.openSnackbar(msg ? msg : 'Se actualizó correctamente tu contraseña', 'Cerrar');
          this.spinner.hide();
          this.router.navigate(['/login']);
        }
        , error: (err) => {
          this.spinner.hide();
          console.error(err);
          const msg = err.error.message;
          this.openSnackbar(msg ? msg : 'Ocurrió un error, intenta nuevamente', 'Cerrar');
        }
      }).add(() => {
        this.spinner.hide();
        this.resetPasswordForm.reset();
      });
    }
  }

  gotoSignup() {
    this.router.navigate(['/register'])
  }

  goToLogin() {
    this.router.navigate(['/login'])
  }

  gotoHome() {
    this.router.navigate([''])
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  openPrivacyTermsDialog() {
    const dialogRef = this.dialog.open(PrivacyTermsComponent, {
      minWidth: '40vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openTermsConditionsDialog() {
    const dialogRef = this.dialog.open(TermsConditionsComponent, {
      minWidth: '40vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
