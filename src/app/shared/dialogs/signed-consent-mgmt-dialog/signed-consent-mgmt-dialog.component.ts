import { Component, Inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { InformedConsent } from '../../../core/models/informed-consent.model';
import { User } from '../../../core/models/user.model';
import { Patient } from '../../../core/models/patient.model';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxDropzoneModule } from 'ngx-dropzone';


@Component({
  selector: 'app-signed-consent-mgmt-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    NgxDropzoneModule
  ],
  templateUrl: './signed-consent-mgmt-dialog.component.html',
  styleUrl: './signed-consent-mgmt-dialog.component.scss'
})
export class SignedConsentMgmtDialogComponent {
  patientName = new FormControl({ value: '', disabled: true });
  informedConsent = new FormControl('');
  informedConsentList :InformedConsent[] = []
  files: File[] = [];
  currentPatient: Patient = new Patient()
  constructor(public dialogRef: MatDialogRef<SignedConsentMgmtDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any){
      if(dialogData){
        this.informedConsentList = dialogData.informedConsentList
        this.currentPatient = dialogData.patient
        this.patientName.setValue(this.buildPatientFullName(this.currentPatient))
      }
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
      consent_id: this.informedConsent.value,
      patient_id: this.currentPatient.id,
      file_url: 'https://example.com/signed-consent.pdf'
    }
    
    this.dialogRef.close(payloadResponse);
  }
  
  cancel(){
    this.dialogRef.close()
  }
  
  buildPatientFullName(userData: User): string{    
    const firstname = userData.name != undefined ? userData.name :  ''   
    const middleName = userData.middle_name != undefined ? userData.middle_name :  '' 
    const lastName = userData.last_name != undefined ? userData.last_name :  '' 
    return firstname.concat(' ').concat(middleName).concat(' ').concat(lastName)
  }
}
