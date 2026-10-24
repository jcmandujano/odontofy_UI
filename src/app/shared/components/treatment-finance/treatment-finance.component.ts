import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { TreatmentChargeRow, TreatmentChargeService } from '../../../core/services/treatment-charge.service';
import { NoDataFoundComponent } from '../no-data-found/no-data-found.component';

@Component({
  selector: 'app-treatment-finance',
  imports: [CommonModule, FormsModule, MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSelectModule, NoDataFoundComponent],
  templateUrl: './treatment-finance.component.html',
  styleUrl: './treatment-finance.component.scss',
})
export class TreatmentFinanceComponent implements OnChanges {
  @Input({ required: true }) patientId = 0;
  @Input() treatmentPlanId?: number;
  @Input() scope = 'all';
  @Output() financialChanged = new EventEmitter<void>();
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<unknown>;
  @ViewChild('payDialog') payDialog!: TemplateRef<unknown>;
  rows: TreatmentChargeRow[] = [];
  summary = { charged: '0.00', paid: '0.00', balance: '0.00' };
  selected = new Set<number>();
  paymentRows: Array<TreatmentChargeRow & { paymentAmount: number }> = [];
  confirming: TreatmentChargeRow | null = null;
  pageIndex = 0; pageSize = 10; total = 0;
  busy = false; error = ''; dialogError = ''; discount = 0; occurredOn = this.localDate(); method = 'CASH';
  private paymentKey = '';
  private dialogRef?: MatDialogRef<unknown>;
  readonly labels = { UNCONFIRMED: 'Sin cargo', UNPAID: 'Pendiente', PARTIAL: 'Pago parcial', PAID: 'Pagado' };
  constructor(private service: TreatmentChargeService, private dialog: MatDialog) {}
  ngOnChanges(): void { this.pageIndex = 0; this.load(); }
  load(): void {
    if (!this.patientId) return;
    this.busy = true; this.error = ''; this.selected.clear();
    this.service.list(this.patientId, this.pageIndex + 1, this.pageSize, this.scope, this.treatmentPlanId).subscribe({
      next: response => { this.rows = response.data?.results ?? []; this.total = response.data?.total ?? 0; this.summary = response.meta?.summary ?? { charged: '0.00', paid: '0.00', balance: '0.00' }; this.busy = false; },
      error: error => { this.error = error?.error?.message ?? 'No se pudieron cargar los cargos.'; this.busy = false; },
    });
  }
  page(event: PageEvent): void { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; this.load(); }
  label(status: TreatmentChargeRow['financialStatus']): string { return this.labels[status]; }
  toggle(row: TreatmentChargeRow, checked: boolean): void { if (row.chargeId) { if (checked) this.selected.add(row.chargeId); else this.selected.delete(row.chargeId); } }
  openConfirm(row: TreatmentChargeRow): void {
    if (this.busy || this.dialogRef || row.chargeId || !row.catalogLinked || row.clinicalStatus === 'CANCELLED') return;
    this.confirming = row; this.discount = 0; this.occurredOn = this.localDate(); this.open(this.confirmDialog);
  }
  confirm(): void {
    if (this.busy || !this.confirming) return;
    this.busy = true; this.dialogError = '';
    const discount = this.confirming.treatmentPlanId === null ? Number(this.discount).toFixed(2) : '0.00';
    const expectedTotal = this.confirming.treatmentPlanId === null ? (Number(this.confirming.subtotal) - Number(discount)).toFixed(2) : this.confirming.total;
    this.service.confirm(this.patientId, this.confirming.treatmentId, this.occurredOn, discount, expectedTotal).subscribe({ next: () => this.saved(), error: error => this.failed(error) });
  }
  openPay(row?: TreatmentChargeRow): void {
    if (this.busy || this.dialogRef) return;
    const rows = row ? [row] : this.rows.filter(candidate => candidate.chargeId !== null && this.selected.has(candidate.chargeId));
    this.paymentRows = rows.filter(candidate => candidate.chargeId !== null && Number(candidate.balance) > 0).map(candidate => ({ ...candidate, paymentAmount: Number(candidate.balance) }));
    if (!this.paymentRows.length) return;
    this.paymentKey = crypto.randomUUID(); this.occurredOn = this.localDate(); this.method = 'CASH'; this.open(this.payDialog);
  }
  pay(): void {
    if (this.busy || !this.paymentRows.length) return;
    this.busy = true; this.dialogError = '';
    this.service.pay(this.patientId, this.occurredOn, this.method, this.paymentRows.map(row => ({ chargeId: row.chargeId!, amount: Number(row.paymentAmount).toFixed(2) })), this.paymentKey).subscribe({ next: () => this.saved(), error: error => this.failed(error) });
  }
  private open(template: TemplateRef<unknown>): void {
    this.dialogError = '';
    this.dialogRef = this.dialog.open(template, { width: '620px', maxWidth: '94vw', maxHeight: '90vh' });
    this.dialogRef.afterClosed().subscribe(() => { this.dialogRef = undefined; this.confirming = null; });
  }
  private saved(): void { this.busy = false; this.dialogRef?.close(); this.load(); this.financialChanged.emit(); }
  private failed(error: { error?: { message?: string } }): void { this.busy = false; this.dialogError = error?.error?.message ?? 'No se pudo registrar la operación. Puedes reintentar.'; }
  localDate(): string { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; }
}
