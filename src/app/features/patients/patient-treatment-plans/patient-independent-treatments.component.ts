import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { TreatmentFinanceComponent } from '../../../shared/components/treatment-finance/treatment-finance.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { TreatmentPlanItem, TreatmentPlanItemStatus, TREATMENT_PLAN_ITEM_STATUS_LABELS } from '../../../core/models/treatment-plan.model';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { UserConceptsService } from '../../../core/services/user-concepts.service';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { TreatmentPlanItemMgmtDialogComponent } from '../../../shared/dialogs/treatment-plan-item-mgmt-dialog/treatment-plan-item-mgmt-dialog.component';

@Component({
  selector: 'app-patient-independent-treatments',
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatPaginatorModule, MatTableModule, MatTooltipModule, NoDataFoundComponent, TreatmentFinanceComponent],
  templateUrl: './patient-independent-treatments.component.html',
  styleUrls: ['./patient-treatment-plans.component.scss', './patient-independent-treatments.component.scss'],
})
export class PatientIndependentTreatmentsComponent implements OnChanges {
  @Input({ required: true }) patientId = 0;
  @ViewChild(TreatmentFinanceComponent) finance?: TreatmentFinanceComponent;
  items: TreatmentPlanItem[] = [];
  columns = ['name', 'tooth', 'quantity', 'price', 'subtotal', 'status', 'actions'];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  busy = false;
  error = '';
  readonly labels = TREATMENT_PLAN_ITEM_STATUS_LABELS;
  statusLabel(status: TreatmentPlanItemStatus): string { return this.labels[status]; }

  constructor(private treatments: TreatmentPlanService, private catalog: UserConceptsService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnChanges(): void { this.pageIndex = 0; this.load(); }

  load(): void {
    if (!this.patientId) return;
    this.busy = true;
    this.error = '';
    this.treatments.listPatientTreatments(this.patientId, this.pageIndex + 1, this.pageSize).pipe(finalize(() => this.busy = false)).subscribe({
      next: response => { this.items = response.data?.results ?? []; this.total = response.data?.total ?? 0; this.finance?.load(); },
      error: error => this.error = error?.error?.message ?? 'No se pudieron cargar los tratamientos.',
    });
  }

  page(event: PageEvent): void { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; this.load(); }

  open(item?: TreatmentPlanItem): void {
    if (this.busy) return;
    this.busy = true;
    this.catalog.listAllUserConcepts().pipe(finalize(() => this.busy = false)).subscribe({
      next: concepts => {
        if (!concepts.length && !item) { this.snackBar.open('Agrega un tratamiento al catálogo en Configuraciones antes de continuar.', 'Cerrar', { duration: 5000 }); return; }
        this.dialog.open(TreatmentPlanItemMgmtDialogComponent, { width: '600px', maxWidth: '94vw', maxHeight: '90vh', data: { mode: item ? 'edit' : 'create', conceptList: concepts, treatmentPlanItem: item } }).afterClosed().subscribe(payload => {
          if (!payload) return;
          this.busy = true;
          const operation = item ? this.treatments.updatePatientTreatment(this.patientId, item.id, payload) : this.treatments.createPatientTreatment(this.patientId, payload);
          operation.subscribe({ next: () => this.load(), error: error => { this.busy = false; this.notifyError(error); } });
        });
      },
      error: error => this.notifyError(error),
    });
  }

  changeStatus(item: TreatmentPlanItem): void {
    if (this.busy) return;
    this.dialog.open(TreatmentPlanItemMgmtDialogComponent, { width: '500px', maxWidth: '94vw', data: { mode: 'status', treatmentPlanItem: item } }).afterClosed().subscribe(payload => {
      if (payload) this.setStatus(item, payload.status);
    });
  }

  cancel(item: TreatmentPlanItem): void {
    if (this.busy) return;
    this.dialog.open(ConfirmDialogComponent, { data: { title: 'Cancelar tratamiento', message: `¿Cancelar «${item.name}»? Se conservará en el historial. Esto no anula cargos ni abonos registrados.`, confirmText: 'Cancelar tratamiento' } }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.setStatus(item, TreatmentPlanItemStatus.CANCELLED);
    });
  }

  private setStatus(item: TreatmentPlanItem, status: TreatmentPlanItemStatus): void {
    this.busy = true;
    this.treatments.updatePatientTreatmentStatus(this.patientId, item.id, { status }).subscribe({ next: () => this.load(), error: error => { this.busy = false; this.notifyError(error); } });
  }

  private notifyError(error: { error?: { message?: string } }): void {
    this.snackBar.open(error?.error?.message ?? 'No se pudo guardar el tratamiento.', 'Cerrar', { duration: 5000 });
  }
}
