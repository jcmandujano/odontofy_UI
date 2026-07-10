import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
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
  TreatmentPlanStatus
} from '../../../core/models/treatment-plan.model';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';

@Component({
  selector: 'app-treatment-plan-detail',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
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
  displayedColumns: string[] = ['name', 'tooth', 'area', 'quantity', 'unitPrice', 'subtotal', 'phase', 'priority', 'status', 'completedAt'];

  readonly statusLabels = TREATMENT_PLAN_STATUS_LABELS;
  readonly itemStatusLabels = TREATMENT_PLAN_ITEM_STATUS_LABELS;
  readonly priorityLabels = TREATMENT_PLAN_ITEM_PRIORITY_LABELS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private treatmentPlanService: TreatmentPlanService,
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
