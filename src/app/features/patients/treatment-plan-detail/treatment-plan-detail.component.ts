import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import {
  TREATMENT_PLAN_ITEM_PRIORITY_LABELS,
  TREATMENT_PLAN_ITEM_STATUS_LABELS,
  TREATMENT_PLAN_STATUS_LABELS,
  TreatmentPlan,
  TreatmentPlanItem,
  TreatmentPlanItemPriority,
  TreatmentPlanItemStatus,
  TreatmentPlanStatus,
  UpdateTreatmentPlanRequest,
  UpdateTreatmentPlanStatusRequest
} from '../../../core/models/treatment-plan.model';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { TreatmentPlanMgmtDialogComponent } from '../../../shared/dialogs/treatment-plan-mgmt-dialog/treatment-plan-mgmt-dialog.component';

@Component({
  selector: 'app-treatment-plan-detail',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
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
  selectedStatus: TreatmentPlanStatus | null = null;
  displayedColumns: string[] = ['name', 'tooth', 'area', 'quantity', 'unitPrice', 'subtotal', 'phase', 'priority', 'status', 'completedAt'];

  readonly statusLabels = TREATMENT_PLAN_STATUS_LABELS;
  readonly itemStatusLabels = TREATMENT_PLAN_ITEM_STATUS_LABELS;
  readonly priorityLabels = TREATMENT_PLAN_ITEM_PRIORITY_LABELS;
  readonly statusOptions = Object.values(TreatmentPlanStatus);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private treatmentPlanService: TreatmentPlanService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private elementRef: ElementRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'recetas',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/icons/dashboard_recetas.svg')
    );
  }

  ngOnInit(): void {
    this.treatmentPlanId = Number(this.route.snapshot.paramMap.get('id'));
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId'));

    if (this.treatmentPlanId) {
      this.loadTreatmentPlanDetail();
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
        this.selectedStatus = response.data?.status ?? null;
        this.spinner.hide();
      },
      error: error => {
        this.spinner.hide();
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
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

  hasClinicalInfo(): boolean {
    return !!(
      this.treatmentPlan?.description ||
      this.treatmentPlan?.diagnosis ||
      this.treatmentPlan?.patient_complaint ||
      this.treatmentPlan?.clinical_observations ||
      this.treatmentPlan?.prognosis
    );
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
        this.updateTreatmentPlan(result);
      }
    });
  }

  updateTreatmentPlan(payload: UpdateTreatmentPlanRequest): void {
    this.spinner.show();
    this.treatmentPlanService.updateTreatmentPlan(this.treatmentPlanId, payload).subscribe({
      next: response => {
        this.openSnackbar(response.message || 'Plan de tratamiento actualizado correctamente', 'Ok');
        this.loadTreatmentPlanDetail();
      },
      error: error => {
        this.spinner.hide();
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
      }
    });
  }

  confirmStatusUpdate(): void {
    if (!this.selectedStatus || !this.treatmentPlan || this.selectedStatus === this.treatmentPlan.status) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Actualizar estado',
        message: `¿Seguro que quieres cambiar el estado del plan a ${this.getStatusLabel(this.selectedStatus)}?`,
        confirmText: 'Actualizar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateTreatmentPlanStatus({
          status: this.selectedStatus as TreatmentPlanStatus
        });
      } else {
        this.selectedStatus = this.treatmentPlan?.status ?? null;
      }
    });
  }

  updateTreatmentPlanStatus(payload: UpdateTreatmentPlanStatusRequest): void {
    this.spinner.show();
    this.treatmentPlanService.updateTreatmentPlanStatus(this.treatmentPlanId, payload).subscribe({
      next: response => {
        this.openSnackbar(response.message || 'Estado del plan actualizado correctamente', 'Ok');
        this.loadTreatmentPlanDetail();
      },
      error: error => {
        this.spinner.hide();
        this.selectedStatus = this.treatmentPlan?.status ?? null;
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
      }
    });
  }

  isStatusChanged(): boolean {
    return !!this.selectedStatus && !!this.treatmentPlan && this.selectedStatus !== this.treatmentPlan.status;
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
}
