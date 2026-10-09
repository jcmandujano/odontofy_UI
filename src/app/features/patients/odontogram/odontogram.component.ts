import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import {
  EXCLUSIVE_TOOTH_CONDITIONS,
  ODONTOGRAM_CONDITIONS,
  ODONTOGRAM_SURFACES,
  WHOLE_TOOTH_CONDITIONS,
  Odontogram,
  OdontogramCondition,
  OdontogramDentition,
  OdontogramFinding,
  OdontogramFindingInput,
  OdontogramSummary,
  OdontogramSurface,
  quadrantsForDentition,
  toothAsset,
} from '../../../core/models/odontogram.model';
import {
  TREATMENT_PLAN_ITEM_STATUS_LABELS,
  TreatmentPlan,
  TreatmentPlanItem,
  TreatmentPlanStatus,
} from '../../../core/models/treatment-plan.model';
import { OdontogramService } from '../../../core/services/odontogram.service';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';

@Component({
  selector: 'app-odontogram',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './odontogram.component.html',
  styleUrl: './odontogram.component.scss',
})
export class OdontogramComponent implements OnInit, OnDestroy {
  readonly conditions = ODONTOGRAM_CONDITIONS;
  readonly surfaces = ODONTOGRAM_SURFACES;
  readonly treatmentStatusLabels = TREATMENT_PLAN_ITEM_STATUS_LABELS;

  patientId = 0;
  charts: OdontogramSummary[] = [];
  chart: Odontogram | null = null;
  chartPage = 1;
  hasMoreCharts = false;
  loading = false;
  busy = false;
  error = '';
  showCreate = false;
  newDentition: OdontogramDentition = 'ADULT';
  newTitle = '';
  chartTitle = '';
  draftFindings: OdontogramFindingInput[] = [];
  dirty = false;
  selectedToothCode = '';
  editingIndex: number | null = null;
  condition: OdontogramCondition = 'CARIES';
  surface: OdontogramSurface | '' = '';
  notes = '';
  linkingFindingId: number | null = null;
  plans: TreatmentPlan[] = [];
  selectedPlanId = 0;
  planItems: TreatmentPlanItem[] = [];
  loadingPlans = false;

  private readonly destroy$ = new Subject<void>();
  private requestedChartId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly odontograms: OdontogramService,
    private readonly treatments: TreatmentPlanService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const patientId = Number(params.get('id'));
      this.patientId = Number.isSafeInteger(patientId) && patientId > 0 ? patientId : 0;
      this.chart = null;
      this.charts = [];
      this.error = this.patientId ? '' : 'Selecciona un paciente para consultar su odontograma.';
      if (this.patientId) this.loadCharts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canLeave(): boolean {
    return !this.dirty || window.confirm('Hay cambios sin guardar en el odontograma. ¿Deseas salir y descartarlos?');
  }

  get quadrants() {
    return quadrantsForDentition(this.chart?.dentition ?? 'ADULT');
  }

  get selectedFindings(): Array<{ finding: OdontogramFindingInput; index: number }> {
    return this.draftFindings
      .map((finding, index) => ({ finding, index }))
      .filter(({ finding }) => finding.toothCode === this.selectedToothCode);
  }

  get linkingFinding(): OdontogramFinding | null {
    return this.chart?.findings.find(finding => finding.id === this.linkingFindingId) ?? null;
  }

  get availableItems(): TreatmentPlanItem[] {
    const linked = this.linkingFinding?.treatmentPlanItemIds ?? [];
    return this.planItems.filter(item => item.status !== 'CANCELLED' && !linked.includes(item.id));
  }

  loadCharts(page = 1, preferredChartId?: number): void {
    if (!this.patientId) return;
    const patientId = this.patientId;
    this.loading = true;
    this.error = '';
    this.odontograms.list(patientId, page).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (this.patientId !== patientId) return;
        const result = response.data;
        const entries = result?.results ?? [];
        this.charts = page === 1 ? entries : [...this.charts, ...entries];
        this.chartPage = page;
        this.hasMoreCharts = this.charts.length < (result?.total ?? 0);
        this.loading = false;
        if (preferredChartId) {
          this.selectChart(preferredChartId);
        } else if (page === 1 && !this.chart && entries.length) {
          this.selectChart(entries.find(entry => !entry.archivedAt)?.id ?? entries[0].id);
        }
      },
      error: error => {
        if (this.patientId !== patientId) return;
        this.loading = false;
        this.error = this.errorMessage(error);
      },
    });
  }

  selectChart(odontogramId: number): void {
    if (!odontogramId || this.busy) return;
    if (this.dirty && !window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos?')) return;
    this.loading = true;
    this.error = '';
    this.requestedChartId = odontogramId;
    const patientId = this.patientId;
    this.odontograms.get(odontogramId).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (this.patientId !== patientId || this.requestedChartId !== odontogramId || !response.data) return;
        this.applyChart(response.data);
        this.loading = false;
      },
      error: error => {
        if (this.patientId !== patientId || this.requestedChartId !== odontogramId) return;
        this.loading = false;
        this.error = this.errorMessage(error);
      },
    });
  }

  onChartSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const previous = this.chart?.id;
    this.selectChart(Number(select.value));
    if (previous) select.value = String(previous);
  }

  createChart(): void {
    if (!this.patientId || this.busy) return;
    if (this.dirty && !window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos y crear otro odontograma?')) return;
    const title = this.newTitle.trim();
    this.busy = true;
    this.odontograms.create(this.patientId, this.newDentition, title || null)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          this.busy = false;
          this.showCreate = false;
          this.newTitle = '';
          if (response.data) {
            this.applyChart(response.data);
            this.loadCharts(1);
          }
          this.notify('Odontograma creado. Selecciona una pieza para registrar hallazgos.');
        },
        error: error => this.fail(error),
      });
  }

  selectTooth(code: string): void {
    this.selectedToothCode = code;
    this.resetFindingForm();
    this.linkingFindingId = null;
  }

  toothAsset(code: string): string {
    return toothAsset(code, this.chart?.dentition ?? 'ADULT');
  }

  toothState(code: string): string {
    const findings = this.draftFindings.filter(finding => finding.toothCode === code);
    if (findings.some(finding => finding.condition === 'MISSING')) return 'missing';
    if (findings.some(finding => finding.condition === 'NOT_ERUPTED')) return 'not-erupted';
    if (findings.some(finding => ['CARIES', 'FRACTURE', 'EXTRACTION_INDICATED'].includes(finding.condition))) return 'attention';
    return findings.length ? 'recorded' : 'empty';
  }

  findingCount(code: string): number {
    return this.draftFindings.filter(finding => finding.toothCode === code).length;
  }

  conditionLabel(condition: OdontogramCondition): string {
    return this.conditions.find(option => option.value === condition)?.label ?? condition;
  }

  surfaceLabel(surface: OdontogramSurface | null): string {
    return this.surfaces.find(option => option.value === surface)?.label ?? 'Pieza completa';
  }

  setCondition(value: OdontogramCondition): void {
    this.condition = value;
    if (WHOLE_TOOTH_CONDITIONS.has(value)) this.surface = '';
  }

  isWholeToothCondition(): boolean {
    return WHOLE_TOOTH_CONDITIONS.has(this.condition);
  }

  editFinding(index: number): void {
    const finding = this.draftFindings[index];
    if (!finding) return;
    this.editingIndex = index;
    this.condition = finding.condition;
    this.surface = finding.surface ?? '';
    this.notes = finding.notes ?? '';
  }

  saveFinding(): void {
    if (!this.chart || this.chart.archivedAt || !this.selectedToothCode) return;
    const next: OdontogramFindingInput = {
      toothCode: this.selectedToothCode,
      condition: this.condition,
      surface: WHOLE_TOOTH_CONDITIONS.has(this.condition) ? null : this.surface || null,
      notes: this.notes.trim() || null,
    };
    const others = this.draftFindings.filter((_, index) => index !== this.editingIndex);
    if (others.some(finding => finding.toothCode === next.toothCode &&
      (EXCLUSIVE_TOOTH_CONDITIONS.has(finding.condition) || EXCLUSIVE_TOOTH_CONDITIONS.has(next.condition)))) {
      this.notify('Una pieza sana, ausente o sin erupcionar no admite otros hallazgos.');
      return;
    }
    if (others.some(finding => this.findingKey(finding) === this.findingKey(next))) {
      this.notify('Ese hallazgo ya está registrado en la pieza.');
      return;
    }
    if (this.editingIndex !== null) {
      const previous = this.draftFindings[this.editingIndex];
      const persisted = this.persistedFinding(previous);
      if (persisted?.treatmentPlanItemIds.length && this.findingKey(previous) !== this.findingKey(next) &&
        !window.confirm('Cambiar el diagnóstico o la superficie quitará sus vínculos con tratamientos al guardar. ¿Continuar?')) return;
      this.draftFindings[this.editingIndex] = next;
    } else {
      this.draftFindings = [...this.draftFindings, next];
    }
    this.dirty = true;
    this.resetFindingForm();
  }

  removeFinding(index: number): void {
    const finding = this.draftFindings[index];
    if (!finding) return;
    const persisted = this.persistedFinding(finding);
    if (persisted?.treatmentPlanItemIds.length &&
      !window.confirm('Al guardar, este hallazgo perderá sus vínculos con tratamientos. ¿Continuar?')) return;
    this.draftFindings = this.draftFindings.filter((_, candidate) => candidate !== index);
    this.dirty = true;
    this.resetFindingForm();
  }

  persistedFinding(input: OdontogramFindingInput): OdontogramFinding | null {
    return this.chart?.findings.find(finding => this.findingKey(finding) === this.findingKey(input)) ?? null;
  }

  discardChanges(): void {
    if (this.chart) this.applyChart(this.chart);
  }

  saveChanges(): void {
    if (!this.chart || !this.dirty || this.busy || this.chart.archivedAt) return;
    this.busy = true;
    this.odontograms.update(this.chart.id, this.chartTitle.trim() || null, this.draftFindings)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          this.busy = false;
          if (response.data) {
            this.applyChart(response.data, true);
            this.updateChartSummary(response.data);
          }
          this.notify('Odontograma guardado.');
        },
        error: error => this.fail(error),
      });
  }

  archiveChart(): void {
    if (!this.chart || this.busy || this.dirty || !window.confirm('¿Archivar este odontograma? Podrás restaurarlo después.')) return;
    this.busy = true;
    this.odontograms.archive(this.chart.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => this.finishLifecycle(response.data, 'Odontograma archivado.'),
      error: error => this.fail(error),
    });
  }

  restoreChart(): void {
    if (!this.chart || this.busy) return;
    this.busy = true;
    this.odontograms.restore(this.chart.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => this.finishLifecycle(response.data, 'Odontograma restaurado.'),
      error: error => this.fail(error),
    });
  }

  openTreatmentPicker(finding: OdontogramFinding): void {
    if (!this.chart || this.chart.archivedAt || this.dirty) return;
    this.linkingFindingId = finding.id;
    this.plans = [];
    this.selectedPlanId = 0;
    this.planItems = [];
    this.loadingPlans = true;
    this.treatments.listTreatmentPlansByPatient(this.patientId, 1, 100)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          this.plans = (response.data?.results ?? []).filter(plan => plan.status !== TreatmentPlanStatus.CANCELLED);
          this.loadingPlans = false;
        },
        error: error => {
          this.loadingPlans = false;
          this.notify(this.errorMessage(error));
        },
      });
  }

  selectTreatmentPlan(planId: number): void {
    this.selectedPlanId = planId;
    this.planItems = [];
    if (!planId) return;
    this.loadingPlans = true;
    this.treatments.getTreatmentPlanDetail(planId).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (this.selectedPlanId !== planId) return;
        this.planItems = response.data?.TreatmentPlanItems ?? [];
        this.loadingPlans = false;
      },
      error: error => {
        if (this.selectedPlanId !== planId) return;
        this.loadingPlans = false;
        this.notify(this.errorMessage(error));
      },
    });
  }

  linkItem(itemId: number): void {
    if (!this.chart || !this.linkingFindingId || this.busy) return;
    this.busy = true;
    this.odontograms.link(this.chart.id, this.linkingFindingId, itemId)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          this.busy = false;
          if (response.data) this.applyChart(response.data, true);
          this.notify('Tratamiento vinculado al hallazgo.');
        },
        error: error => this.fail(error),
      });
  }

  unlinkItem(findingId: number, itemId: number): void {
    if (!this.chart || this.busy || this.dirty) return;
    this.busy = true;
    this.odontograms.unlink(this.chart.id, findingId, itemId)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          this.busy = false;
          if (response.data) this.applyChart(response.data, true);
          this.notify('Tratamiento desvinculado.');
        },
        error: error => this.fail(error),
      });
  }

  goToPlans(): void {
    this.router.navigate(['/patient-treatment-plans', { id: this.patientId }]);
  }

  goToPlan(planId: number): void {
    this.router.navigate(['/treatment-plan-detail', { id: planId, patientId: this.patientId }]);
  }

  private applyChart(chart: Odontogram, preserveTooth = false): void {
    const previousTooth = this.selectedToothCode;
    this.chart = chart;
    this.chartTitle = chart.title ?? '';
    this.draftFindings = chart.findings.map(({ toothCode, condition, surface, notes }) => ({
      toothCode, condition, surface, notes,
    }));
    this.dirty = false;
    this.selectedToothCode = preserveTooth && previousTooth ? previousTooth : chart.dentition === 'ADULT' ? '11' : '51';
    this.linkingFindingId = null;
    this.resetFindingForm();
  }

  private updateChartSummary(chart: Odontogram): void {
    this.charts = this.charts.map(summary => summary.id === chart.id ? chart : summary);
  }

  private finishLifecycle(chart: Odontogram | null, message: string): void {
    this.busy = false;
    if (chart) {
      this.applyChart(chart, true);
      this.updateChartSummary(chart);
    }
    this.notify(message);
  }

  private resetFindingForm(): void {
    this.editingIndex = null;
    this.condition = 'CARIES';
    this.surface = '';
    this.notes = '';
  }

  private findingKey(finding: OdontogramFindingInput): string {
    return `${finding.toothCode}:${finding.condition}:${finding.surface ?? ''}`;
  }

  private fail(error: unknown): void {
    this.busy = false;
    this.notify(this.errorMessage(error));
  }

  private errorMessage(error: unknown): string {
    const response = error as { error?: { message?: string; errors?: Array<{ message?: string }> } };
    return response?.error?.errors?.[0]?.message
      ?? response?.error?.message
      ?? 'No fue posible completar la operación. Intenta de nuevo.';
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 4500 });
  }
}
