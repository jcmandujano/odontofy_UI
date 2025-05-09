import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxDropzoneModule } from 'ngx-dropzone';

@Component({
    selector: 'app-user-consents-mgmt',
    imports: [
        MatDialogTitle,
        MatDialogActions,
        MatDialogClose,
        MatFormFieldModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatInputModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        NgxDropzoneModule
    ],
    templateUrl: './user-consents-mgmt.component.html',
    styleUrl: './user-consents-mgmt.component.scss'
})
export class UserConsentsMgmtComponent {
  userConsentsForm: FormGroup;
  files: File[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserConsentsMgmtComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.userConsentsForm = this.fb.group({
      // Add the form controls here
      name: [data?.name || '', Validators.required],
      description: [data?.description || '', Validators.required],
      file_url: [data?.description || '', Validators.required],
    });
  } 

  onSelect(event: any) {
    //de aqui subir a una nube, obtener el url y pasarlo de regreso
    this.files = [event.addedFiles[0]];
  }
  
  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  onSave(): void { 
    const payloadResponse = {
      name: this.userConsentsForm.get('name')?.value,
      description: this.userConsentsForm.get('description')?.value,
      file_url: 'https://example.com/signed-consent.pdf'
    }
    
    this.dialogRef.close(payloadResponse);
  }

}
