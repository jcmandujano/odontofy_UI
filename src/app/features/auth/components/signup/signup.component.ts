import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/models/user.model';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SessionStorageService } from '../../../../core/services/session-storage.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

export interface signUpUserData{
  name?: string
  middle_name?: string
  last_name?: string
  date_of_birth?: Date
  phone?: string
  avatar?: string
  email?: string 
  password?:string
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ 
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatNativeDateModule

  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-MX' }],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  hide = true
/*   faEnvelope = faEnvelope;
  fakey = faKeyboard
  faContactBook = faContactBook */
  userdata = new User;
  spinner= false
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  signupData: signUpUserData | undefined
  signupForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    apellido_pat: new FormControl('', Validators.required),
    apellido_mat: new FormControl('', Validators.required),
    email: new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.emailRegex)])),
    password: new FormControl('', Validators.required),
    fechaNac: new FormControl('', Validators.required),
    telefono: new FormControl('', Validators.required),
  });
  constructor( private router: Router,
    public authService: AuthService, 
    private snackBar: MatSnackBar,
    private sessionService : SessionStorageService ) { }

  ngOnInit(): void {
  }

  gotoHome(){
    this.router.navigate([''])
  }

  gotoLogin(){
    this.router.navigate(['/login'])
  }

  doSignUp(){
    this.signupForm.markAllAsTouched()
    if(this.signupForm.valid){
      this.spinner = true
      this.authService.register(this.buildSignupData(this.signupForm.value)).subscribe(data=>{
        this.userdata = data;
        const pass = this.signupForm.value.password || ''
        this.doLogin(data.user.email, pass)
        this.spinner = false
      })
    }else{
      this.validateForm()
    }
  }

  doLogin(username: string, password: string){
    this.authService.login(username, password).subscribe(data=>{
      this.userdata = data.user;
      this.storeSession(data)
      this.router.navigate(['/dashboard'])
    },(error)=>{
      console.log('ERRORRRRR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  storeSession(userData:any){
    this.sessionService.saveToken(userData.token)
    this.sessionService.saveUser(userData.user)
  }

  validateForm(){
    if(this.signupForm.controls.email.errors?.['pattern']){
      this.openSnackbar('Por favor ingresa un correo valido','Ok')
      return
    }
    if(this.signupForm.controls.nombre.status === 'INVALID' ){
      this.openSnackbar('Por favor ingresa un tu nombre','Ok')
      return
    }else if(this.signupForm.controls.apellido_pat.status === 'INVALID'){
      this.openSnackbar('Por favor ingresa tu apellido paterno','Ok')
      return
    }else if(this.signupForm.controls.apellido_mat.status === 'INVALID'){
      this.openSnackbar('Por favor ingresa tu apellido materno','Ok')
      return
    }else if(this.signupForm.controls.fechaNac.status === 'INVALID'){
      this.openSnackbar('Por favor ingresa tu fecha de nacimiento','Ok')
      return
    }else if(this.signupForm.controls.telefono.status === 'INVALID'){
      this.openSnackbar('Por favor ingresa tu numero de teléfono','Ok')
      return
    }else if(this.signupForm.controls.email.status === 'INVALID'){
      this.openSnackbar('Por favor ingresa tu correo','Ok')
      return
    }else if(this.signupForm.controls.password.status === 'INVALID'){
      this.openSnackbar('Por favor ingresa tu password','Ok')
      return
    }
  }

  buildSignupData(formData: any): signUpUserData{
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

}


