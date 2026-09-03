import { CommonModule } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CreateTreatmentPlanRequest, TREATMENT_PLAN_STATUS_LABELS, TreatmentPlan, TreatmentPlanStatus } from '../../../core/models/treatment-plan.model';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { TreatmentPlanMgmtDialogComponent } from '../../../shared/dialogs/treatment-plan-mgmt-dialog/treatment-plan-mgmt-dialog.component';

type TreatmentPlanStatusFilter = TreatmentPlanStatus | 'ACTIVE' | 'ALL';

@Component({
  selector: 'app-patient-treatment-plans',
  imports: [
    CommonModule,
    NavBarComponent,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    NgxSpinnerModule,
    NoDataFoundComponent
  ],
  templateUrl: './patient-treatment-plans.component.html',
  styleUrl: './patient-treatment-plans.component.scss'
})
export class PatientTreatmentPlansComponent {
  displayedColumns: string[] = ['title', 'status', 'startDate', 'endDate', 'total', 'createdAt', 'actions'];
  allTreatmentPlans: TreatmentPlan[] = [];
  dataSource: TreatmentPlan[] = [];
  selectedPatientId = 0;
  length = 0;
  pageIndex = 0;
  pageSize = 10;
  pageEvent: PageEvent = new PageEvent();
  selectedStatusFilter: TreatmentPlanStatusFilter = 'ACTIVE';

  readonly statusLabels = TREATMENT_PLAN_STATUS_LABELS;
  readonly statusOptions = Object.values(TreatmentPlanStatus);
  private readonly treatmentPlansFetchLimit = 100;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private treatmentPlanService: TreatmentPlanService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.selectedPatientId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.selectedPatientId) {
      this.loadTreatmentPlans();
    }
  }

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
  }

  loadTreatmentPlans(page: number = 1): void {
    this.spinner.show();
    this.treatmentPlanService.listTreatmentPlansByPatient(this.selectedPatientId, 1, this.treatmentPlansFetchLimit).subscribe({
      next: response => {
        this.allTreatmentPlans = response.data?.results ?? [];
        this.pageIndex = Math.max(page - 1, 0);
        this.applyStatusFilter();
        this.spinner.hide();
      },
      error: error => {
        this.spinner.hide();
        this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar');
      }
    });
  }

  handlePageEvent(e: PageEvent): void {
    this.pageEvent = e;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.updateDisplayedTreatmentPlans();
  }

  setStatusFilter(status: TreatmentPlanStatusFilter): void {
    this.selectedStatusFilter = status;
    this.pageIndex = 0;
    this.applyStatusFilter();
  }

  openTreatmentPlanDialog(): void {
    const dialogRef = this.dialog.open(TreatmentPlanMgmtDialogComponent, {
      minWidth: '45vw',
      maxWidth: '720px',
      panelClass: 'custom-dialog-container',
      data: {
        mode: 'create',
        suggestedTitle: this.getNextTreatmentPlanTitle()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTreatmentPlan(result.treatmentPlan);
      }
    });
  }

  createTreatmentPlan(payload: CreateTreatmentPlanRequest): void {
    this.spinner.show();
    this.treatmentPlanService.createTreatmentPlan(this.selectedPatientId, payload).subscribe({
      next: response => {
        this.spinner.hide();
        this.openSnackbar(response.message || 'Plan de tratamiento creado correctamente', 'Ok');
        this.loadTreatmentPlans(1);
      },
      error: error => {
        this.spinner.hide();
        this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar');
      }
    });
  }

  goToTreatmentPlanDetail(treatmentPlanId: number): void {
    this.router.navigate(['treatment-plan-detail', {
      id: treatmentPlanId,
      patientId: this.selectedPatientId
    }]);
  }

  confirmDeleteTreatmentPlan(treatmentPlan: TreatmentPlan): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar plan de tratamiento',
        message: `¿Estás seguro de eliminar «${treatmentPlan.title}»? También se eliminarán sus tratamientos.`,
        confirmText: 'Eliminar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTreatmentPlan(treatmentPlan.id);
      }
    });
  }

  deleteTreatmentPlan(treatmentPlanId: number): void {
    this.spinner.show();
    this.treatmentPlanService.cancelTreatmentPlan(treatmentPlanId).subscribe({
      next: response => {
        this.spinner.hide();
        this.openSnackbar(response.message || 'Plan de tratamiento eliminado correctamente', 'Ok');
        const pageToLoad = this.dataSource.length === 1 && this.pageIndex > 0
          ? this.pageIndex
          : this.pageIndex + 1;
        this.loadTreatmentPlans(pageToLoad);
      },
      error: error => {
        this.spinner.hide();
        this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar');
      }
    });
  }

  getStatusLabel(status: TreatmentPlanStatus): string {
    return this.statusLabels[status] ?? status;
  }

  getStatusClass(status: TreatmentPlanStatus): string {
    return `status-${status.toLowerCase().replace(/_/g, '-')}`;
  }

  toCurrencyValue(value: number | string): number {
    return Number(value) || 0;
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
      ?? 'Ocurrió un problema al procesar tu solicitud';
  }

  private applyStatusFilter(): void {
    const filteredTreatmentPlans = this.getFilteredTreatmentPlans();
    this.length = filteredTreatmentPlans.length;

    if (this.pageIndex > 0 && this.pageIndex * this.pageSize >= this.length) {
      this.pageIndex = Math.max(Math.ceil(this.length / this.pageSize) - 1, 0);
    }

    this.updateDisplayedTreatmentPlans(filteredTreatmentPlans);
  }

  private updateDisplayedTreatmentPlans(filteredTreatmentPlans = this.getFilteredTreatmentPlans()): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.dataSource = filteredTreatmentPlans.slice(start, end);
  }

  private getFilteredTreatmentPlans(): TreatmentPlan[] {
    if (this.selectedStatusFilter === 'ALL') {
      return this.allTreatmentPlans;
    }

    if (this.selectedStatusFilter === 'ACTIVE') {
      return this.allTreatmentPlans.filter(treatmentPlan => treatmentPlan.status !== TreatmentPlanStatus.CANCELLED);
    }

    return this.allTreatmentPlans.filter(treatmentPlan => treatmentPlan.status === this.selectedStatusFilter);
  }

  private getNextTreatmentPlanTitle(): string {
    const nextPlanNumber = this.allTreatmentPlans.length + 1;
    return `Plan de tratamiento ${String(nextPlanNumber).padStart(4, '0')}`;
  }
}
