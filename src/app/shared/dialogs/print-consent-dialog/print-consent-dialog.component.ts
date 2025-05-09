import { Component, Inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { InformedConsent } from '../../../core/models/informed-consent.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-print-consent-dialog',
    imports: [
        MatDialogModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        FormsModule,
        MatSelectModule,
        MatButtonModule
    ],
    templateUrl: './print-consent-dialog.component.html',
    styleUrl: './print-consent-dialog.component.scss'
})
export class PrintConsentDialogComponent {
  informedConsent = new FormControl('');
  informedConsentList :InformedConsent[] = []
  constructor(
    public dialogRef: MatDialogRef<PrintConsentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any){
      if(dialogData){
        this.informedConsentList = dialogData
      }
  }

  onSave(): void {
      const data = {
        filename: this.informedConsent.getRawValue()
      }
      this.dialogRef.close(data);
    }

  cancel(){
    this.dialogRef.close()
  }
}
