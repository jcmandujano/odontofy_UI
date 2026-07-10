import { CommonModule } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CreateTreatmentPlanRequest, TREATMENT_PLAN_STATUS_LABELS, TreatmentPlan, TreatmentPlanStatus } from '../../../core/models/treatment-plan.model';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { TreatmentPlanMgmtDialogComponent } from '../../../shared/dialogs/treatment-plan-mgmt-dialog/treatment-plan-mgmt-dialog.component';

@Component({
  selector: 'app-patient-treatment-plans',
  imports: [
    CommonModule,
    NavBarComponent,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
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
  dataSource: TreatmentPlan[] = [];
  selectedPatientId = 0;
  length = 0;
  pageIndex = 0;
  pageSize = 10;
  pageEvent: PageEvent = new PageEvent();

  readonly statusLabels = TREATMENT_PLAN_STATUS_LABELS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private treatmentPlanService: TreatmentPlanService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
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
    this.treatmentPlanService.listTreatmentPlansByPatient(this.selectedPatientId, page, this.pageSize).subscribe({
      next: response => {
        this.dataSource = response.data?.results ?? [];
        this.length = response.data?.total ?? 0;
        this.pageIndex = (response.data?.page ?? 1) - 1;
        this.pageSize = response.data?.perPage ?? this.pageSize;
        this.spinner.hide();
      },
      error: error => {
        this.spinner.hide();
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
      }
    });
  }

  handlePageEvent(e: PageEvent): void {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.loadTreatmentPlans(this.pageIndex + 1);
  }

  openTreatmentPlanDialog(): void {
    const dialogRef = this.dialog.open(TreatmentPlanMgmtDialogComponent, {
      minWidth: '45vw',
      maxWidth: '720px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTreatmentPlan(result);
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
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
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
        message: `Estas seguro de eliminar "${treatmentPlan.title}"? Tambien se eliminaran sus tratamientos.`,
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
        this.openSnackbar(`Ocurrio un error: ${this.getErrorMessage(error)}`, 'Ok');
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
      ?? 'Ocurrio un problema al procesar tu solicitud';
  }
}
