import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/models/user.model';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import moment from 'moment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SessionStorageService } from '../../../../core/services/session-storage.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDialog } from '@angular/material/dialog';
import { PrivacyTermsComponent } from '../../../../shared/dialogs/privacy-terms/privacy-terms.component';
import { TermsConditionsComponent } from '../../../../shared/dialogs/terms-conditions/terms-conditions.component';

export interface signUpUserData {
  name?: string
  middle_name?: string
  last_name?: string
  date_of_birth?: Date
  phone?: string
  avatar?: string
  email?: string
  password?: string
}

const DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}' -]*$/u;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/;
const MINIMUM_PASSWORD_LENGTH = 8;

function birthDateValidator(minimumAge: number, maximumAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = moment.isMoment(control.value)
      ? control.value.clone()
      : moment(control.value, 'DD/MM/YYYY', true);

    if (!birthDate.isValid()) {
      return null;
    }

    const today = moment().startOf('day');
    if (birthDate.isAfter(today, 'day')) {
      return { futureDate: true };
    }

    if (birthDate.isBefore(today.clone().subtract(maximumAge, 'years'), 'day')) {
      return { maximumAge: true };
    }

    return birthDate.isAfter(today.clone().subtract(minimumAge, 'years'), 'day')
      ? { minimumAge: true }
      : null;
  };
}

function mexicanPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    return String(control.value).replace(/\D/g, '').length === 10
      ? null
      : { mexicanPhone: true };
  };
}

@Component({
  selector: 'app-signup',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  providers: [
    provideMomentDateAdapter(DATE_FORMATS),
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' }
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  hide = true
  readonly maximumBirthDate = moment().startOf('day').subtract(18, 'years');
  readonly minimumBirthDate = moment().startOf('day').subtract(120, 'years');
  userdata = new User;
  spinner = false
  signupData: signUpUserData | undefined
  signupForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.pattern(NAME_PATTERN)]),
    apellido_pat: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.pattern(NAME_PATTERN)]),
    apellido_mat: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.pattern(NAME_PATTERN)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(254)]),
    password: new FormControl('', [Validators.required, Validators.minLength(MINIMUM_PASSWORD_LENGTH), Validators.pattern(PASSWORD_PATTERN)]),
    fechaNac: new FormControl('', [Validators.required, birthDateValidator(18, 120)]),
    telefono: new FormControl('', [Validators.required, mexicanPhoneValidator()]),
    acceptedTerms: new FormControl(false, Validators.requiredTrue),
  });
  isRegistrationComplete = false;
  constructor(private router: Router,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private sessionService: SessionStorageService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  gotoHome() {
    this.router.navigate([''])
  }

  gotoLogin() {
    this.router.navigate(['/login'])
  }

  doSignUp() {
    this.signupForm.markAllAsTouched()
    if (this.signupForm.valid) {
      this.spinner = true
      this.authService.register(this.buildSignupData(this.signupForm.value)).subscribe({
        next: (response) => {
          this.openSnackbar(response.message, 'Aceptar')
          this.spinner = false
          this.isRegistrationComplete = true
        },
        error: (error) => {
          this.spinner = false
          const message = error?.error?.message || 'Ocurrió un error al crear tu cuenta.'
          this.openSnackbar(message, 'Aceptar')
        }
      })
    } else {
      this.validateForm()
    }
  }

  doLogin(username: string, password: string) {
    this.authService.login(username, password).subscribe(response => {
      if (response.data) {
        this.userdata = response.data.user;
        this.storeSession(response.data)
        this.router.navigate(['/dashboard'])
      }
    }, (error) => {
      console.log('ERRORRRRR', error.error.error.message)
      this.openSnackbar(`Ocurrió un error: ${error.error.error.message}`, 'Aceptar')
    })
  }

  storeSession(userData: any) {
    this.sessionService.saveToken(userData.token)
    this.sessionService.saveUser(userData.user)
  }

  validateForm() {
    if (this.signupForm.controls.email.errors?.['email']) {
      this.openSnackbar('Ingresa un correo electrónico válido.', 'Aceptar')
      return
    }
    if (this.signupForm.controls.nombre.errors?.['pattern']) {
      this.openSnackbar('El nombre solo puede contener letras, espacios, guiones y apóstrofes.', 'Aceptar')
      return
    } else if (this.signupForm.controls.apellido_pat.errors?.['pattern'] || this.signupForm.controls.apellido_mat.errors?.['pattern']) {
      this.openSnackbar('Los apellidos solo pueden contener letras, espacios, guiones y apóstrofes.', 'Aceptar')
      return
    } else if (this.signupForm.controls.nombre.status === 'INVALID') {
      this.openSnackbar('Ingresa tu nombre.', 'Aceptar')
      return
    } else if (this.signupForm.controls.apellido_pat.status === 'INVALID') {
      this.openSnackbar('Ingresa tu apellido paterno.', 'Aceptar')
      return
    } else if (this.signupForm.controls.apellido_mat.status === 'INVALID') {
      this.openSnackbar('Ingresa tu apellido materno.', 'Aceptar')
      return
    } else if (this.signupForm.controls.fechaNac.errors?.['futureDate']) {
      this.openSnackbar('La fecha de nacimiento no puede ser futura.', 'Aceptar')
      return
    } else if (this.signupForm.controls.fechaNac.errors?.['maximumAge']) {
      this.openSnackbar('Ingresa una fecha de nacimiento válida.', 'Aceptar')
      return
    } else if (this.signupForm.controls.fechaNac.errors?.['minimumAge']) {
      this.openSnackbar('Debes tener al menos 18 años para registrarte.', 'Aceptar')
      return
    } else if (this.signupForm.controls.fechaNac.status === 'INVALID') {
      this.openSnackbar('Ingresa tu fecha de nacimiento.', 'Aceptar')
      return
    } else if (this.signupForm.controls.telefono.errors?.['mexicanPhone']) {
      this.openSnackbar('Ingresa los 10 dígitos de tu teléfono mexicano.', 'Aceptar')
      return
    } else if (this.signupForm.controls.telefono.status === 'INVALID') {
      this.openSnackbar('Ingresa tu número de teléfono.', 'Aceptar')
      return
    } else if (this.signupForm.controls.email.status === 'INVALID') {
      this.openSnackbar('Ingresa tu correo electrónico.', 'Aceptar')
      return
    } else if (this.signupForm.controls.password.status === 'INVALID') {
      this.openSnackbar('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.', 'Aceptar')
      return
    } else if (this.signupForm.controls.acceptedTerms.status === 'INVALID') {
      this.openSnackbar('Debes aceptar los términos y condiciones y el aviso de privacidad.', 'Aceptar')
      return
    }
  }

  buildSignupData(formData: any): signUpUserData {
    const data: signUpUserData = {
      name: formData.nombre,
      middle_name: formData.apellido_pat,
      last_name: formData.apellido_mat,
      date_of_birth: formData.fechaNac,
      phone: formData.telefono,
      avatar: '',
      email: formData.email,
      password: formData.password,
    }
    return data;
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


