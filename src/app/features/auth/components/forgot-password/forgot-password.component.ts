import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PrivacyTermsComponent } from '../../../../shared/dialogs/privacy-terms/privacy-terms.component';
import { TermsConditionsComponent } from '../../../../shared/dialogs/terms-conditions/terms-conditions.component';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    imports: [
        MatIconModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        RouterModule,
        NgxSpinnerModule,
        MatButtonModule
    ],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
    resetPasswordForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email])
    });

    constructor(private router: Router, private snackBar: MatSnackBar,
        private dialog: MatDialog,
        public authService: AuthService,
        private spinner: NgxSpinnerService) { }

    requestPasswordReset() {
        this.resetPasswordForm.markAllAsTouched();

        if (this.resetPasswordForm.valid) {
            this.spinner.show();
            const { email } = this.resetPasswordForm.value;
            // Aquí puedes agregar la lógica para manejar el envío del formulario,
            // como llamar a un servicio para enviar el correo de restablecimiento de contraseña.
            console.log('Correo electrónico para restablecer la contraseña:', email);
            this.authService.forgotPassword(email!).subscribe({
                next: (res) => {
                    console.log(res);
                    const msg = res.data;
                    this.openSnackbar(msg ? msg : 'Se proceso correctamente tu solicitud', 'Cerrar');
                    this.spinner.hide();
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
