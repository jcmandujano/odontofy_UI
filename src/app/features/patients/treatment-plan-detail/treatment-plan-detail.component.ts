import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import {
  TREATMENT_PLAN_ITEM_PRIORITY_LABELS,
  TREATMENT_PLAN_ITEM_STATUS_LABELS,
  TREATMENT_PLAN_STATUS_LABELS,
  CreateTreatmentPlanItemRequest,
  TreatmentPlan,
  TreatmentPlanItem,
  TreatmentPlanItemPriority,
  TreatmentPlanItemStatus,
  TreatmentPlanStatus,
  UpdateTreatmentPlanItemStatusRequest,
  UpdateTreatmentPlanRequest,
  UpdateTreatmentPlanStatusRequest
} from '../../../core/models/treatment-plan.model';
import { UserConcept } from '../../../core/models/user-concept.model';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { UserConceptsService } from '../../../core/services/user-concepts.service';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { TreatmentPlanItemMgmtDialogComponent } from '../../../shared/dialogs/treatment-plan-item-mgmt-dialog/treatment-plan-item-mgmt-dialog.component';
import {
  TreatmentPlanMgmtDialogComponent,
  TreatmentPlanMgmtDialogResult
} from '../../../shared/dialogs/treatment-plan-mgmt-dialog/treatment-plan-mgmt-dialog.component';

@Component({
  selector: 'app-treatment-plan-detail',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    NavBarComponent,
    NgxSpinnerModule,
    NoDataFoundComponent
  ],
  templateUrl: './treatment-plan-detail.component.html',
  styleUrl: './treatment-plan-detail.component.scss'
})
export class TreatmentPlanDetailComponent {
  treatmentPlanId = 0;
  patientId = 0;
  treatmentPlan: TreatmentPlan | null = null;
  conceptList: UserConcept[] = [];
  processingItemIds = new Set<number>();
  displayedColumns: string[] = ['name', 'tooth', 'area', 'quantity', 'unitPrice', 'subtotal', 'phase', 'priority', 'status', 'actions'];

  readonly statusLabels = TREATMENT_PLAN_STATUS_LABELS;
  readonly itemStatusLabels = TREATMENT_PLAN_ITEM_STATUS_LABELS;
  readonly priorityLabels = TREATMENT_PLAN_ITEM_PRIORITY_LABELS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private treatmentPlanService: TreatmentPlanService,
    private userConceptsService: UserConceptsService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.treatmentPlanId = Number(this.route.snapshot.paramMap.get('id'));
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId'));

    if (this.treatmentPlanId) {
      this.loadTreatmentPlanDetail();
      this.loadUserConcepts();
    }
  }

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
  }

  loadTreatmentPlanDetail(): void {
    this.spinner.show();
    this.treatmentPlanService.getTreatmentPlanDetail(this.treatmentPlanId).subscribe({
      next: response => {
        this.treatmentPlan = response.data;
        this.spinner.hide();
      },
      error: error => {
        this.spinner.hide();
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
      }
    });
  }

  loadUserConcepts(): void {
    this.userConceptsService.listUserConcepts(1, 100).subscribe({
      next: response => {
        this.conceptList = response.data?.results ?? [];
      },
      error: error => {
        this.openSnackbar(`Ocurrio un error al cargar conceptos: ${this.getErrorMessage(error)}`, 'Ok');
      }
    });
  }

  goBack(): void {
    if (this.patientId) {
      this.router.navigate(['patient-treatment-plans', { id: this.patientId }]);
      return;
    }

    this.location.back();
  }

  get treatmentPlanItems(): TreatmentPlanItem[] {
    return this.treatmentPlan?.TreatmentPlanItems ?? [];
  }

  openEditTreatmentPlanDialog(): void {
    if (!this.treatmentPlan) {
      return;
    }

    const dialogRef = this.dialog.open(TreatmentPlanMgmtDialogComponent, {
      minWidth: '45vw',
      maxWidth: '720px',
      panelClass: 'custom-dialog-container',
      data: {
        mode: 'edit',
        treatmentPlan: this.treatmentPlan
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateTreatmentPlanFromDialog(result);
      }
    });
  }

  updateTreatmentPlanFromDialog(result: TreatmentPlanMgmtDialogResult): void {
    const selectedStatus = result.status;
    const shouldUpdateStatus = !!selectedStatus && !!this.treatmentPlan && selectedStatus !== this.treatmentPlan.status;

    this.updateTreatmentPlan(result.treatmentPlan as UpdateTreatmentPlanRequest, shouldUpdateStatus ? selectedStatus : undefined);
  }

  updateTreatmentPlan(payload: UpdateTreatmentPlanRequest, nextStatus?: TreatmentPlanStatus): void {
    this.spinner.show();
    this.treatmentPlanService.updateTreatmentPlan(this.treatmentPlanId, payload).subscribe({
      next: response => {
        if (nextStatus) {
          this.updateTreatmentPlanStatus({ status: nextStatus });
          return;
        }

        this.openSnackbar(response.message || 'Plan de tratamiento actualizado correctamente', 'Ok');
        this.loadTreatmentPlanDetail();
      },
      error: error => {
        this.spinner.hide();
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
      }
    });
  }

  updateTreatmentPlanStatus(payload: UpdateTreatmentPlanStatusRequest): void {
    this.treatmentPlanService.updateTreatmentPlanStatus(this.treatmentPlanId, payload).subscribe({
      next: response => {
        this.openSnackbar(response.message || 'Plan de tratamiento actualizado correctamente', 'Ok');
        this.loadTreatmentPlanDetail();
      },
      error: error => {
        this.spinner.hide();
        this.openSnackbar(`Ocurrio un error al actualizar el estado: ${this.getErrorMessage(error)}`, 'Ok');
      }
    });
  }

  openTreatmentPlanItemDialog(): void {
    const dialogRef = this.dialog.open(TreatmentPlanItemMgmtDialogComponent, {
      minWidth: '45vw',
      maxWidth: '760px',
      panelClass: 'custom-dialog-container',
      data: {
        conceptList: this.conceptList
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTreatmentPlanItem(result);
      }
    });
  }

  createTreatmentPlanItem(payload: CreateTreatmentPlanItemRequest): void {
    this.spinner.show();
    this.treatmentPlanService.createTreatmentPlanItem(this.treatmentPlanId, payload).subscribe({
      next: response => {
        this.openSnackbar(response.message || 'Tratamiento agregado correctamente', 'Ok');
        this.loadTreatmentPlanDetail();
      },
      error: error => {
        this.spinner.hide();
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
      }
    });
  }

  openEditTreatmentPlanItemStatusDialog(item: TreatmentPlanItem): void {
    if (this.isItemProcessing(item.id)) {
      return;
    }

    const dialogRef = this.dialog.open(TreatmentPlanItemMgmtDialogComponent, {
      minWidth: '36vw',
      maxWidth: '560px',
      panelClass: 'custom-dialog-container',
      data: {
        mode: 'status',
        treatmentPlanItem: item
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.status && result.status !== item.status) {
        this.updateTreatmentPlanItemStatus(item.id, result);
      }
    });
  }

  updateTreatmentPlanItemStatus(itemId: number, payload: UpdateTreatmentPlanItemStatusRequest): void {
    this.setItemProcessing(itemId, true);
    this.treatmentPlanService.updateTreatmentPlanItemStatus(this.treatmentPlanId, itemId, payload).subscribe({
      next: response => {
        this.openSnackbar(response.message || 'Estado del tratamiento actualizado correctamente', 'Ok');
        this.setItemProcessing(itemId, false);
        this.loadTreatmentPlanDetail();
      },
      error: error => {
        this.setItemProcessing(itemId, false);
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
      }
    });
  }

  confirmDeleteTreatmentPlanItem(item: TreatmentPlanItem): void {
    if (this.isItemProcessing(item.id)) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar tratamiento',
        message: `¿Seguro que quieres eliminar "${item.name}" del plan?`,
        confirmText: 'Eliminar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTreatmentPlanItem(item.id);
      }
    });
  }

  deleteTreatmentPlanItem(itemId: number): void {
    this.setItemProcessing(itemId, true);
    this.treatmentPlanService.deleteTreatmentPlanItem(this.treatmentPlanId, itemId).subscribe({
      next: response => {
        this.openSnackbar(response.message || 'Tratamiento eliminado correctamente', 'Ok');
        this.setItemProcessing(itemId, false);
        this.loadTreatmentPlanDetail();
      },
      error: error => {
        this.setItemProcessing(itemId, false);
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
      }
    });
  }

  getStatusLabel(status: TreatmentPlanStatus): string {
    return this.statusLabels[status] ?? status;
  }

  getItemStatusLabel(status: TreatmentPlanItemStatus): string {
    return this.itemStatusLabels[status] ?? status;
  }

  getPriorityLabel(priority: TreatmentPlanItemPriority | null): string {
    return priority ? this.priorityLabels[priority] ?? priority : '--';
  }

  getStatusClass(status: TreatmentPlanStatus | TreatmentPlanItemStatus): string {
    return `status-${status.toLowerCase().replace(/_/g, '-')}`;
  }

  toCurrencyValue(value: number | string | null | undefined): number {
    return Number(value) || 0;
  }

  getDisplayValue(value: string | number | null | undefined): string | number {
    return value !== null && value !== undefined && value !== '' ? value : '--';
  }

  openSnackbar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  private getErrorMessage(error: any): string {
    return error?.error?.error?.message
      ?? error?.error?.message
      ?? error?.message
      ?? 'Ocurrio un problema al procesar tu solicitud';
  }

  isItemProcessing(itemId: number): boolean {
    return this.processingItemIds.has(itemId);
  }

  private setItemProcessing(itemId: number, isProcessing: boolean): void {
    if (isProcessing) {
      this.processingItemIds.add(itemId);
      return;
    }

    this.processingItemIds.delete(itemId);
  }
}
