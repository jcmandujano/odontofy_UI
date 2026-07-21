import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserConcept } from '../../../core/models/user-concept.model';
import {
  CreateTreatmentPlanItemRequest,
  TREATMENT_PLAN_ITEM_STATUS_LABELS,
  TreatmentPlanItem,
  TreatmentPlanItemStatus,
  UpdateTreatmentPlanItemRequest
} from '../../../core/models/treatment-plan.model';

export interface TreatmentPlanItemMgmtDialogData {
  conceptList?: UserConcept[];
  mode?: 'create' | 'edit' | 'status';
  treatmentPlanItem?: TreatmentPlanItem;
}

@Component({
  selector: 'app-treatment-plan-item-mgmt-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './treatment-plan-item-mgmt-dialog.component.html',
  styleUrl: './treatment-plan-item-mgmt-dialog.component.scss'
})
export class TreatmentPlanItemMgmtDialogComponent {
  readonly manualCaptureValue = 'MANUAL_CAPTURE';
  itemForm: FormGroup;
  conceptList: UserConcept[] = [];
  mode: 'create' | 'edit' | 'status';
  readonly statusLabels = TREATMENT_PLAN_ITEM_STATUS_LABELS;
  readonly statusOptions = Object.values(TreatmentPlanItemStatus);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TreatmentPlanItemMgmtDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TreatmentPlanItemMgmtDialogData | null
  ) {
    this.conceptList = data?.conceptList ?? [];
    this.mode = data?.mode ?? 'create';
    this.itemForm = this.fb.group({
      userConceptId: [this.manualCaptureValue],
      name: ['', Validators.required],
      description: [''],
      tooth: [''],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
      status: [data?.treatmentPlanItem?.status ?? TreatmentPlanItemStatus.PENDING, Validators.required],
    });

    if (data?.treatmentPlanItem) {
      this.patchTreatmentPlanItem(data.treatmentPlanItem);
    }
  }

  onConceptChange(conceptId: number | string): void {
    if (conceptId === this.manualCaptureValue) {
      this.itemForm.patchValue({ name: '' });
      return;
    }

    const selectedConcept = this.conceptList.find(concept => concept.id === Number(conceptId));
    if (!selectedConcept) {
      return;
    }

    this.itemForm.patchValue({
      name: String(selectedConcept.description ?? ''),
      unitPrice: Number(selectedConcept.unit_price ?? 0),
    });
  }

  saveItem(): void {
    if (this.mode === 'status') {
      const statusControl = this.itemForm.controls['status'];
      if (statusControl.invalid) {
        statusControl.markAsTouched();
        return;
      }

      this.dialogRef.close({ status: statusControl.value });
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValue = this.itemForm.value;
    const isManualCapture = formValue.userConceptId === this.manualCaptureValue;
    const payload: CreateTreatmentPlanItemRequest | UpdateTreatmentPlanItemRequest = {
      user_concept_id: isManualCapture ? null : Number(formValue.userConceptId),
      name: formValue.name.trim(),
      description: this.toNullableString(formValue.description),
      tooth: this.toNullableString(formValue.tooth),
      quantity: Number(formValue.quantity),
      unit_price: Number(formValue.unitPrice),
      notes: this.toNullableString(formValue.notes),
    };

    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getStatusLabel(status: TreatmentPlanItemStatus): string {
    return this.statusLabels[status] ?? status;
  }

  get isManualCapture(): boolean {
    return this.itemForm.controls['userConceptId'].value === this.manualCaptureValue;
  }

  get dialogTitle(): string {
    if (this.mode === 'status') {
      return 'Editar Estado del Tratamiento';
    }

    return this.mode === 'edit' ? 'Editar Tratamiento' : 'Agregar Tratamiento';
  }

  get currentStatusLabel(): string {
    const status = this.data?.treatmentPlanItem?.status;
    return status ? this.getStatusLabel(status) : '--';
  }

  getPreviewSubtotal(): number {
    const quantity = Number(this.itemForm.controls['quantity'].value) || 0;
    const unitPrice = Number(this.itemForm.controls['unitPrice'].value) || 0;
    return quantity * unitPrice;
  }

  private toNullableString(value: string | null | undefined): string | null {
    const normalizedValue = value?.trim();
    return normalizedValue ? normalizedValue : null;
  }

  private patchTreatmentPlanItem(item: TreatmentPlanItem): void {
    this.itemForm.patchValue({
      userConceptId: item.user_concept_id ?? this.manualCaptureValue,
      name: item.name,
      description: item.description,
      tooth: item.tooth,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      notes: item.notes,
      status: item.status,
    });
  }
}
