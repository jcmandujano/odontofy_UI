import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { AuthService } from '../../../../core/services/auth.service';
import { SessionStorageService } from '../../../../core/services/session-storage.service';
import { User } from '../../../../core/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PrivacyTermsComponent } from '../../../../shared/dialogs/privacy-terms/privacy-terms.component';
import { TermsConditionsComponent } from '../../../../shared/dialogs/terms-conditions/terms-conditions.component';

@Component({
  selector: 'app-login',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterModule,
    NgxSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  userdata = new User;
  loginForm = new FormGroup({
    username: new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.emailRegex)])),
    password: new FormControl('', Validators.required),
  });
  constructor(private router: Router,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private sessionService: SessionStorageService) { }

  ngOnInit(): void {
  }

  gotoHome() {
    this.router.navigate([''])
  }

  gotoSignup() {
    this.router.navigate(['/register'])
  }

  doLogin() {
    this.spinner.show();
    this.loginForm.markAllAsTouched();

    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authService.login(username!, password!).subscribe({
        next: (response) => {
          this.spinner.hide();

          // Ajustamos aquí: los datos reales están en response.data
          const user = response.data?.user;
          const token = response.data?.token;

          if (user && token) {
            this.userdata = user;
            this.storeSession({ user, token }); // asegúrate que este método use los datos correctos
            this.router.navigate(['/dashboard']);
          } else {
            this.openSnackbar('Credenciales inválidas', 'Ok');
          }
        },
        error: (error) => {
          this.spinner.hide();

          const msg = error?.error?.message || 'Ocurrió un error inesperado';
          this.openSnackbar(`Error: ${msg}`, 'Ok');
        }
      });
    } else {
      this.validateForm();
    }
  }

  validateForm() {
    if (this.loginForm.controls.username.errors?.['pattern']) {
      this.openSnackbar('Por favor ingresa un correo valido', 'Ok')
      return
    }
    if (this.loginForm.controls.username.status === 'INVALID') {
      this.openSnackbar('Por favor ingresa tu correo', 'Ok')
      return
    }
    else if (this.loginForm.controls.password.status === 'INVALID') {
      this.openSnackbar('Por favor ingresa tu contraseña', 'Ok')
      return
    }
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  storeSession(userData: any) {
    this.sessionService.saveToken(userData.token)
    this.sessionService.saveUser(userData.user)
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
