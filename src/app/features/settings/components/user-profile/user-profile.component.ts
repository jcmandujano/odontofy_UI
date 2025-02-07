import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../../../core/models/user.model';
import { SessionStorageService } from '../../../../core/services/session-storage.service';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../../../core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  userProfileForm: FormGroup
  currentUser: User = new User;
  spinner= false
  isEmailDisabled = true
  constructor(
    private sessionService :SessionStorageService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ){
    this.userProfileForm = this.buildUserProfileform()
  }

  ngOnInit(){
    this.currentUser = this.sessionService.getUser();
    console.log('currentUser', this.currentUser)  

    // Patch values to the form
    this.userProfileForm.patchValue({
      name: this.currentUser.name || '',
      middle_name: this.currentUser.middle_name || '',
      last_name: this.currentUser.last_name || '',
      date_of_birth: this.currentUser.date_of_birth || '',
      phone: this.currentUser.phone || '',
      avatar: this.currentUser.avatar || '',
      email: this.currentUser.email || ''
    });
  }

  buildUserProfileform(): FormGroup{
    return new FormGroup({
      name: new FormControl('', Validators.required),
      middle_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required),
      date_of_birth: new FormControl('', Validators.required),
      phone: new FormControl('', [Validators.required, Validators.pattern('[- +()0-9]+')]),
      avatar: new FormControl(''),
      email: new FormControl('', Validators.required)
    })
  }

  updateProfile(){
    if(this.userProfileForm.valid){
      this.spinner = true
      console.log('updateProfile', this.userProfileForm.value)
      const updatedUser = this.userProfileForm.value
      delete updatedUser.email
      this.userService.updateUser(this.currentUser.id, this.userProfileForm.value).subscribe(data=>{
        console.log('data', data) 
        this.sessionService.saveUser(data)
        this.openSnackbar('Se actualizó la informacion correctamente', 'Ok')
        this.spinner = false
      },(error)=>{
        this.spinner = false
        console.log('ERROR', error)
        this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
      })
      }
    
  }

  getInitials(firstName:string = '', lastName:string = '') {
    return firstName[0].toUpperCase() + lastName[0].toUpperCase();
  }

  //hook al cambiar el valor de la fecha de nacimiento
  onDateChange(eventChange: MatDatepickerInputEvent<Date>){
    console.log('data', eventChange)
  }

  //mostramos el error de telefono por valido o por formato
  getPhoneErrorMessage() {
    if (this.userProfileForm.controls['phone'].hasError('required')) {
      return 'Debes ingresar el email';
    }

    return this.userProfileForm.controls['phone'].hasError('pattern') ? 'No es un telefono valido' : '';
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
