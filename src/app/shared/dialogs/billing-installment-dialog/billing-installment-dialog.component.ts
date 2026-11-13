import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Payment } from '../../../core/models/payment.model';
import { PaymentService } from '../../../core/services/payment.service';
import { CurrencyInputDirective } from '../../directives/currency-input.directive';

@Component({
  selector: 'app-billing-installment-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, CurrencyInputDirective],
  template: `
    <h2 mat-dialog-title>Registrar abono</h2>
    <mat-dialog-content>
      <p>{{data.payment.displayConcepts}}</p>
      <p>Adeudo pendiente: <strong>{{data.payment.outstandingAmount | currency:'MXN'}}</strong></p>
      <form [formGroup]="form" id="billing-installment-form" (ngSubmit)="save()">
        <mat-form-field appearance="outline"><mat-label>Importe recibido</mat-label><input matInput appCurrencyInput formControlName="amountReceived"><mat-error>Ingresa un importe mayor a cero y hasta el adeudo pendiente</mat-error></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Fecha</mat-label><input matInput type="date" formControlName="occurredOn" [min]="data.payment.payment_date" [max]="today"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Forma de pago</mat-label><mat-select formControlName="paymentMethod"><mat-option value="CASH">Efectivo</mat-option><mat-option value="DEBIT_CARD">Tarjeta de débito</mat-option><mat-option value="CREDIT_CARD">Tarjeta de crédito</mat-option><mat-option value="BANK_TRANSFER">Transferencia</mat-option><mat-option value="OTHER">Otro</mat-option></mat-select></mat-form-field>
      </form>
      @if (error) { <p role="alert">{{error}}</p> }
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button mat-dialog-close [disabled]="saving">Cancelar</button><button mat-button type="submit" form="billing-installment-form" [disabled]="saving || form.invalid">{{saving ? 'Guardando…' : 'Registrar abono'}}</button></mat-dialog-actions>
  `,
  styleUrl: './billing-installment-dialog.component.scss',
})
export class BillingInstallmentDialogComponent {
  readonly today = localDate();
  readonly form;
  private readonly key = crypto.randomUUID();
  saving = false;
  error = '';
  constructor(@Inject(MAT_DIALOG_DATA) public data: { patientId: number; payment: Payment }, private service: PaymentService, private ref: MatDialogRef<BillingInstallmentDialogComponent>, fb: FormBuilder) {
    this.form = fb.nonNullable.group({
      amountReceived: [Number(data.payment.outstandingAmount), [Validators.required, Validators.min(0.01), Validators.max(Number(data.payment.outstandingAmount))]],
      occurredOn: [this.today, Validators.required], paymentMethod: ['CASH', Validators.required],
    });
  }
  save(): void {
    if (this.saving || this.form.invalid) return;
    const input = this.form.getRawValue();
    this.saving = true; this.error = ''; this.ref.disableClose = true; this.form.disable();
    this.service.createInstallment(this.data.patientId, this.data.payment.id, { ...input, amountReceived: Number(input.amountReceived).toFixed(2) }, this.key).subscribe({
      next: () => { this.ref.close(true); },
      error: error => { this.saving = false; this.ref.disableClose = false; this.form.enable(); this.error = error?.error?.message ?? 'No se pudo registrar el abono. Revisa el importe y reintenta.'; },
    });
  }
}
const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
