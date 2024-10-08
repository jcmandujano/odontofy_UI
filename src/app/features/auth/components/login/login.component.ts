import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../../core/services/auth.service';
import { SessionStorageService } from '../../../../core/services/session-storage.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterModule,
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
  constructor( private router: Router,
    public authService: AuthService, 
    private snackBar: MatSnackBar,
    private sessionService : SessionStorageService) { }

  ngOnInit(): void {
  }

  gotoHome(){
    this.router.navigate([''])
  }

  gotoSignup(){
    this.router.navigate(['/register'])
  }

  doLogin(){
    this.loginForm.markAllAsTouched()
    if(this.loginForm.valid){
      this.authService.login(this.loginForm.value.username!, this.loginForm.value.password!).subscribe((data: { user: any; })=>{
        this.userdata = data.user;
        this.storeSession(data)
        this.router.navigate(['/dashboard'])
      },(error: { error: { error: { message: any; }; }; })=>{
        console.log('ERRORRRRR', error.error.error.message)
        this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
      })
    }else{
      this.validateForm()
    }
  }

  validateForm(){
    if(this.loginForm.controls.username.errors?.['pattern']){
      this.openSnackbar('Por favor ingresa un correo valido','Ok')
      return
    }
    if(this.loginForm.controls.username.status === 'INVALID'){
      this.openSnackbar('Por favor ingresa tu correo','Ok')
      return
    }
    else if(this.loginForm.controls.password.status === 'INVALID'){
      this.openSnackbar('Por favor ingresa tu contraseña','Ok')
      return
    }
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  storeSession(userData:any){
    this.sessionService.saveToken(userData.token)
    this.sessionService.saveUser(userData.user)
  }

}
