import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  OdontogramPlanPreview,
  OdontogramPlanCandidate,
  quadrantsForDentition,
  toothAsset,
} from '../../../core/models/odontogram.model';
import {
  TREATMENT_PLAN_ITEM_STATUS_LABELS,
  TreatmentPlanItem,
} from '../../../core/models/treatment-plan.model';
import { UserConcept } from '../../../core/models/user-concept.model';
import { UserConceptsService } from '../../../core/services/user-concepts.service';
import { OdontogramService } from '../../../core/services/odontogram.service';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';

@Component({
  selector: 'app-odontogram',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatSelectModule, MatTooltipModule, NoDataFoundComponent],
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
  findingToothCode = '';
  editingIndex: number | null = null;
  condition: OdontogramCondition = 'CARIES';
  surface: OdontogramSurface | '' = '';
  notes = '';
  linkingFindingId: number | null = null;
  patientTreatments: TreatmentPlanItem[] = [];
  treatmentPage = 1; treatmentTotalPages = 0;
  loadingTreatments = false; loadingCatalog = false; pickerError = '';
  catalog: UserConcept[] = []; catalogSearch = ''; selectedConceptId = 0;
  treatmentQuantity = 1; treatmentNotes = '';
  private creationKey = '';
  private pickerRequestId = 0;

  private readonly destroy$ = new Subject<void>();
  private requestedChartId = 0;
  private findingDialogRef: MatDialogRef<unknown> | null = null;
  @ViewChild('planDialog') private planDialog!: TemplateRef<unknown>;
  private planDialogRef: MatDialogRef<unknown> | null = null;
  planPreview: OdontogramPlanPreview | null = null;
  planSelected = new Set<number>();
  planTitle = ''; planReviewed = false; planLoading = false; planError = '';
  private planKey = '';
  private planReviewRequestId = 0;
  @ViewChild('findingDialog') private findingDialog!: TemplateRef<unknown>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly odontograms: OdontogramService,
    private readonly treatments: TreatmentPlanService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly catalogService: UserConceptsService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const patientId = Number(params.get('id'));
      this.patientId = Number.isSafeInteger(patientId) && patientId > 0 ? patientId : 0;
      this.chart = null;
      this.charts = [];
      this.error = this.patientId ? '' : 'Selecciona un paciente para consultar su odontograma.';
      const chartId = Number(params.get('chartId'));
      if (this.patientId) this.loadCharts(1, Number.isSafeInteger(chartId) && chartId > 0 ? chartId : undefined);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.findingDialogRef?.close();
    this.planDialogRef?.close();
    this.destroy$.complete();
  }

  canLeave(): boolean {
    return !this.dirty || window.confirm('Hay cambios sin guardar en el odontograma. ¿Deseas salir y descartarlos?');
  }
  openPlanReview(): void {
    if (!this.chart || this.chart.archivedAt || this.dirty || this.busy || this.loading || this.planDialogRef) return;
    this.planTitle = this.chart.title ? `Plan · ${this.chart.title}`.slice(0, 255) : 'Plan de tratamiento';
    this.planDialogRef = this.dialog.open(this.planDialog, { width: '960px', maxWidth: '96vw', maxHeight: '92vh', disableClose: true, panelClass: 'odontogram-plan-dialog', ariaLabel: 'Revisar borrador de plan de tratamiento' });
    this.planDialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => { this.planDialogRef = null; this.planReviewRequestId++; this.planLoading = false; });
    this.refreshPlanReview();
  }
  refreshPlanReview(): void {
    if (!this.chart || this.busy) return;
    const chartId = this.chart.id;
    const requestId = ++this.planReviewRequestId;
    this.planKey = crypto.randomUUID(); this.planSelected.clear(); this.planReviewed = false; this.planLoading = true; this.planError = ''; this.planPreview = null;
    this.odontograms.planPreview(chartId).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => { if (this.chart?.id !== chartId || requestId !== this.planReviewRequestId) return; this.planPreview = response.data; this.planLoading = false; },
      error: error => { if (requestId !== this.planReviewRequestId) return; this.planLoading = false; this.planError = this.errorMessage(error); },
    });
  }
  togglePlanTreatment(row: OdontogramPlanCandidate, selected: boolean): void {
    if (!row.eligible || this.busy) return;
    if (selected && this.planSelected.size < 100) this.planSelected.add(row.treatmentId); else this.planSelected.delete(row.treatmentId);
    this.planReviewed = false;
  }
  selectPlanEligible(): void { this.planSelected = new Set((this.planPreview?.treatments ?? []).filter(row => row.eligible).slice(0, 100).map(row => row.treatmentId)); this.planReviewed = false; }
  get selectedPlanTreatments(): OdontogramPlanCandidate[] { return (this.planPreview?.treatments ?? []).filter(row => row.eligible && this.planSelected.has(row.treatmentId)); }
  get planSubtotal(): string {
    const total = this.selectedPlanTreatments.reduce((sum, row) => { const [whole, decimal = ''] = row.subtotal.split('.'); return sum + BigInt(whole) * 100n + BigInt(decimal.padEnd(2, '0')); }, 0n);
    return `${total / 100n}.${String(total % 100n).padStart(2, '0')}`;
  }
  planEligibilityLabel(reason: OdontogramPlanCandidate['reason']): string {
    return reason === 'ALREADY_IN_PLAN' ? 'Ya pertenece a un plan' : reason === 'CHARGE_CONFIRMED' ? 'Tiene cargo confirmado' : reason === 'CANCELLED' ? 'Tratamiento cancelado' : reason === 'CATALOG_REQUIRED' ? 'Requiere catálogo' : 'Disponible';
  }
  createPlan(): void {
    if (!this.chart || this.chart.archivedAt || this.dirty || this.busy || this.planLoading || !this.planReviewed || !this.planTitle.trim() || !this.selectedPlanTreatments.length || this.planPreview?.archived) return;
    this.busy = true; this.planError = '';
    this.odontograms.createPlan(this.chart.id, { title: this.planTitle.trim(), expectedSubtotal: this.planSubtotal, treatments: this.selectedPlanTreatments.map(row => ({ treatmentId: row.treatmentId, revision: row.revision })) }, this.planKey).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => { this.busy = false; if (!response.data) return; this.planDialogRef?.close(); this.notify('Borrador creado. Se conservaron los tratamientos; no se generaron cargos.'); this.goToPlan(response.data.treatmentPlanId); },
      error: error => { this.busy = false; this.planError = this.errorMessage(error); },
    });
  }

  get quadrants() {
    return quadrantsForDentition(this.chart?.dentition ?? 'ADULT');
  }

  get selectedFindings(): Array<{ finding: OdontogramFindingInput; index: number }> {
    return this.draftFindings
      .map((finding, index) => ({ finding, index }))
      .filter(({ finding }) => !this.selectedToothCode || finding.toothCode === this.selectedToothCode);
  }

  get toothCodes(): string[] {
    return this.quadrants.flatMap(quadrant => quadrant.codes).sort();
  }

  get linkingFinding(): OdontogramFinding | null {
    return this.chart?.findings.find(finding => finding.id === this.linkingFindingId) ?? null;
  }

  get availableItems(): TreatmentPlanItem[] {
    const linked = this.linkingFinding?.treatmentPlanItemIds ?? [];
    return this.patientTreatments.filter(item => item.user_concept_id !== null && item.status !== 'CANCELLED' && !linked.includes(item.id));
  }
  get filteredCatalog(): UserConcept[] { const text = this.catalogSearch.trim().toLocaleLowerCase(); return this.catalog.filter(item => item.description.toLocaleLowerCase().includes(text)); }
  get selectedConcept(): UserConcept | undefined { return this.catalog.find(item => item.id === this.selectedConceptId); }
  get duplicateCatalogTreatment(): boolean { return !!this.selectedConceptId && !!this.linkingFinding?.treatmentPlanItems.some(item => item.userConceptId === this.selectedConceptId); }

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
        this.charts = page === 1 ? entries : [...new Map([...this.charts, ...entries].map(chart => [chart.id, chart])).values()];
        this.chartPage = page;
        this.hasMoreCharts = page < (result?.totalPages ?? 0);
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
        if (response.data.patientId !== patientId) { this.loading = false; this.error = 'El odontograma no pertenece a este paciente.'; return; }
        if (!this.charts.some(chart => chart.id === response.data!.id)) this.charts = [response.data, ...this.charts];
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

  onChartSelect(event: MatSelectChange): void {
    const previous = this.chart?.id;
    this.selectChart(Number(event.value));
    if (previous) event.source.value = this.chart?.id ?? previous;
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

  openFindingDialog(index: number | null = null): void {
    if (!this.chart || this.chart.archivedAt || this.busy || this.loading || this.findingDialogRef) return;
    this.resetFindingForm();
    if (index !== null) {
      const finding = this.draftFindings[index];
      if (!finding) return;
      this.editingIndex = index;
      this.findingToothCode = finding.toothCode;
      this.condition = finding.condition;
      this.surface = finding.surface ?? '';
      this.notes = finding.notes ?? '';
    }
    this.findingDialogRef = this.dialog.open(this.findingDialog, {
      width: '600px', maxWidth: '92vw', maxHeight: '90vh',
      ariaLabel: index === null ? 'Agregar hallazgo' : 'Editar hallazgo',
    });
    this.findingDialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.findingDialogRef = null;
      this.resetFindingForm();
    });
  }

  editFinding(index: number): void {
    this.openFindingDialog(index);
  }

  saveFinding(): void {
    if (!this.chart || this.chart.archivedAt || this.busy || !this.toothCodes.includes(this.findingToothCode)) return;
    const next: OdontogramFindingInput = {
      toothCode: this.findingToothCode,
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
      if (persisted?.treatmentPlanItemIds.length && this.findingKey(previous) !== this.findingKey(next)) {
        this.notify('Desvincula primero los tratamientos para cambiar la pieza, el hallazgo o la superficie. Puedes editar sus notas.'); return;
      }
      this.draftFindings[this.editingIndex] = next;
    } else {
      this.draftFindings = [...this.draftFindings, next];
    }
    this.dirty = true;
    this.linkingFindingId = null;
    this.findingDialogRef?.close();
    this.resetFindingForm();
  }

  removeFinding(index: number): void {
    const finding = this.draftFindings[index];
    if (!finding) return;
    const persisted = this.persistedFinding(finding);
    if (persisted?.treatmentPlanItemIds.length) { this.notify('Desvincula primero los tratamientos antes de quitar el hallazgo. Los tratamientos no se eliminarán.'); return; }
    this.draftFindings = this.draftFindings.filter((_, candidate) => candidate !== index);
    this.dirty = true;
    this.linkingFindingId = null;
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
    if (!this.chart || this.dirty || this.busy || this.loading) return;
    this.linkingFindingId = finding.id;
    this.patientTreatments = []; this.catalog = []; this.catalogSearch = ''; this.selectedConceptId = 0;
    this.treatmentQuantity = 1; this.treatmentNotes = ''; this.pickerError = ''; this.creationKey = crypto.randomUUID();
    if (this.chart.archivedAt) return;
    this.loadTreatmentPage(1);
    const chartId = this.chart.id; const findingId = finding.id;
    this.loadingCatalog = true;
    this.catalogService.listAllUserConcepts()
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: catalog => { if (this.chart?.id !== chartId || this.linkingFindingId !== findingId) return; this.catalog = catalog; this.loadingCatalog = false; },
        error: error => { if (this.chart?.id !== chartId || this.linkingFindingId !== findingId) return; this.loadingCatalog = false; this.pickerError = this.errorMessage(error); },
      });
  }
  loadTreatmentPage(page: number): void {
    if (!this.chart || !this.linkingFindingId || page < 1) return;
    const chartId = this.chart.id; const findingId = this.linkingFindingId; const request = ++this.pickerRequestId;
    this.loadingTreatments = true; this.pickerError = '';
    this.treatments.listPatientTreatments(this.patientId, page, 10, 'all').pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (this.chart?.id !== chartId || this.linkingFindingId !== findingId || request !== this.pickerRequestId) return;
        this.patientTreatments = response.data?.results ?? []; this.treatmentPage = page; this.treatmentTotalPages = response.data?.totalPages ?? 0; this.loadingTreatments = false;
      },
      error: error => { if (this.chart?.id !== chartId || this.linkingFindingId !== findingId || request !== this.pickerRequestId) return; this.loadingTreatments = false; this.pickerError = this.errorMessage(error); },
    });
  }
  createTreatment(): void {
    if (!this.chart || this.chart.archivedAt || this.dirty || this.busy || !this.linkingFindingId || !this.selectedConcept || this.duplicateCatalogTreatment || !(this.treatmentQuantity > 0)) return;
    this.busy = true; this.pickerError = '';
    this.odontograms.createTreatment(this.chart.id, this.linkingFindingId, { userConceptId: this.selectedConceptId, quantity: Number(this.treatmentQuantity).toFixed(2), notes: this.treatmentNotes.trim() || null }, this.creationKey)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: response => { this.busy = false; if (response.data) this.applyChart(response.data.odontogram, true); this.notify('Tratamiento independiente creado y asociado. No se generaron cargos ni pagos.'); },
        error: error => { this.busy = false; this.pickerError = this.errorMessage(error); },
      });
  }

  linkItem(itemId: number): void {
    if (!this.chart || this.chart.archivedAt || this.dirty || !this.linkingFindingId || this.busy) return;
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
    if (!this.chart || this.chart.archivedAt || this.busy || this.dirty || !window.confirm('¿Quitar solo la relación con este hallazgo? El tratamiento, su cargo y sus pagos se conservan.')) return;
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
    this.router.navigate(['/patient-treatment-plans', { id: this.patientId, tab: 'independent' }]);
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
    this.selectedToothCode = preserveTooth ? previousTooth : '';
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
    this.findingToothCode = this.selectedToothCode;
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
