import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-confirm-with-password-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './confirm-with-password-dialog.component.html',
  styleUrl: './confirm-with-password-dialog.component.scss'
})
export class ConfirmWithPasswordDialogComponent {
  password = new FormControl('', [Validators.required]);
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  confirm(){
    if (this.password.invalid) {
      return;
    }
    this.dialogRef.close(this.password.value)
  }

}
