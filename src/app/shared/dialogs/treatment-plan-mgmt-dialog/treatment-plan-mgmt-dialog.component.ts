import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateTreatmentPlanRequest } from '../../../core/models/treatment-plan.model';

@Component({
  selector: 'app-treatment-plan-mgmt-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './treatment-plan-mgmt-dialog.component.html',
  styleUrl: './treatment-plan-mgmt-dialog.component.scss'
})
export class TreatmentPlanMgmtDialogComponent {
  treatmentPlanForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TreatmentPlanMgmtDialogComponent>
  ) {
    this.treatmentPlanForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      diagnosis: [''],
      patientComplaint: [''],
      clinicalObservations: [''],
      prognosis: [''],
      estimatedStartDate: [null],
      estimatedEndDate: [null],
      discount: [null, [Validators.min(0)]],
    });
  }

  saveTreatmentPlan(): void {
    if (this.treatmentPlanForm.invalid) {
      this.treatmentPlanForm.markAllAsTouched();
      return;
    }

    const formValue = this.treatmentPlanForm.value;
    const payload: CreateTreatmentPlanRequest = {
      title: formValue.title.trim(),
      description: this.toNullableString(formValue.description),
      diagnosis: this.toNullableString(formValue.diagnosis),
      patient_complaint: this.toNullableString(formValue.patientComplaint),
      clinical_observations: this.toNullableString(formValue.clinicalObservations),
      prognosis: this.toNullableString(formValue.prognosis),
      estimated_start_date: this.formatDateValue(formValue.estimatedStartDate),
      estimated_end_date: this.formatDateValue(formValue.estimatedEndDate),
    };

    if (formValue.discount !== null && formValue.discount !== '') {
      payload.discount = Number(formValue.discount);
    }

    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private toNullableString(value: string | null | undefined): string | null {
    const normalizedValue = value?.trim();
    return normalizedValue ? normalizedValue : null;
  }

  private formatDateValue(value: any): string | null {
    if (!value) {
      return null;
    }

    if (typeof value.format === 'function') {
      return value.format('YYYY-MM-DD');
    }

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    return String(value);
  }
}
