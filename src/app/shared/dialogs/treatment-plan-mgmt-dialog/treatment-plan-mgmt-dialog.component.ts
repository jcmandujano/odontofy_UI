
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import moment from 'moment';
import {
  CreateTreatmentPlanRequest,
  TREATMENT_PLAN_STATUS_LABELS,
  TreatmentPlan,
  TreatmentPlanStatus,
  UpdateTreatmentPlanRequest
} from '../../../core/models/treatment-plan.model';

export interface TreatmentPlanMgmtDialogData {
  mode?: 'create' | 'edit';
  suggestedTitle?: string;
  treatmentPlan?: TreatmentPlan;
}

export interface TreatmentPlanMgmtDialogResult {
  treatmentPlan: CreateTreatmentPlanRequest | UpdateTreatmentPlanRequest;
  status?: TreatmentPlanStatus;
}

@Component({
  selector: 'app-treatment-plan-mgmt-dialog',
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
],
  templateUrl: './treatment-plan-mgmt-dialog.component.html',
  styleUrl: './treatment-plan-mgmt-dialog.component.scss'
})
export class TreatmentPlanMgmtDialogComponent {
  treatmentPlanForm: FormGroup;
  mode: 'create' | 'edit';
  readonly statusLabels = TREATMENT_PLAN_STATUS_LABELS;
  readonly statusOptions = Object.values(TreatmentPlanStatus);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TreatmentPlanMgmtDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TreatmentPlanMgmtDialogData | null
  ) {
    this.mode = data?.mode ?? 'create';
    this.treatmentPlanForm = this.fb.group({
      title: [data?.suggestedTitle ?? '', Validators.required],
      description: [''],
      diagnosis: [''],
      patientComplaint: [''],
      clinicalObservations: [''],
      prognosis: [''],
      estimatedStartDate: [null],
      estimatedEndDate: [null],
      discount: [null, [Validators.min(0)]],
      status: [data?.treatmentPlan?.status ?? TreatmentPlanStatus.DRAFT],
    }, { validators: this.dateRangeValidator() });

    if (data?.treatmentPlan) {
      this.patchTreatmentPlan(data.treatmentPlan);
    }
  }

  saveTreatmentPlan(): void {
    if (this.treatmentPlanForm.invalid) {
      this.treatmentPlanForm.markAllAsTouched();
      return;
    }

    const formValue = this.treatmentPlanForm.value;
    const basePayload: CreateTreatmentPlanRequest = {
      title: formValue.title.trim(),
      description: this.toNullableString(formValue.description),
    };

    const payload: CreateTreatmentPlanRequest | UpdateTreatmentPlanRequest = this.mode === 'edit'
      ? {
          ...basePayload,
          diagnosis: this.toNullableString(formValue.diagnosis),
          patient_complaint: this.toNullableString(formValue.patientComplaint),
          clinical_observations: this.toNullableString(formValue.clinicalObservations),
          prognosis: this.toNullableString(formValue.prognosis),
          estimated_start_date: this.formatDateValue(formValue.estimatedStartDate),
          estimated_end_date: this.formatDateValue(formValue.estimatedEndDate),
        }
      : basePayload;

    if (formValue.discount !== null && formValue.discount !== '') {
      payload.discount = Number(formValue.discount);
    }

    const result: TreatmentPlanMgmtDialogResult = {
      treatmentPlan: payload
    };

    if (this.mode === 'edit') {
      result.status = formValue.status;
    }

    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  get dialogTitle(): string {
    return this.mode === 'edit' ? 'Editar plan de tratamiento' : 'Nuevo plan de tratamiento';
  }

  get currentStatusLabel(): string {
    const status = this.data?.treatmentPlan?.status;
    return status ? this.getStatusLabel(status) : '--';
  }

  getStatusLabel(status: TreatmentPlanStatus): string {
    return this.statusLabels[status] ?? status;
  }

  private patchTreatmentPlan(treatmentPlan: TreatmentPlan): void {
    this.treatmentPlanForm.patchValue({
      title: treatmentPlan.title,
      description: treatmentPlan.description,
      diagnosis: treatmentPlan.diagnosis,
      patientComplaint: treatmentPlan.patient_complaint,
      clinicalObservations: treatmentPlan.clinical_observations,
      prognosis: treatmentPlan.prognosis,
      estimatedStartDate: this.toDatepickerValue(treatmentPlan.estimated_start_date),
      estimatedEndDate: this.toDatepickerValue(treatmentPlan.estimated_end_date),
      discount: treatmentPlan.discount !== null && treatmentPlan.discount !== undefined ? Number(treatmentPlan.discount) : null,
      status: treatmentPlan.status,
    });
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

  private toDatepickerValue(value: string | null): any {
    return value ? moment(value) : null;
  }

  private dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get('estimatedStartDate')?.value;
      const endDate = control.get('estimatedEndDate')?.value;

      if (!startDate || !endDate) {
        return null;
      }

      const normalizedStartDate = this.toComparableDate(startDate);
      const normalizedEndDate = this.toComparableDate(endDate);

      return normalizedEndDate < normalizedStartDate ? { dateRange: true } : null;
    };
  }

  private toComparableDate(value: any): string {
    if (typeof value.format === 'function') {
      return value.format('YYYY-MM-DD');
    }

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    return String(value).split('T')[0];
  }
}
