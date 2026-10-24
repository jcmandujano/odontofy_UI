import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response.model';
import { Odontogram, OdontogramFinding, OdontogramPlanCandidate } from '../../../core/models/odontogram.model';
import { TreatmentPlanItemStatus } from '../../../core/models/treatment-plan.model';
import { UserConcept } from '../../../core/models/user-concept.model';
import { OdontogramService } from '../../../core/services/odontogram.service';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { UserConceptsService } from '../../../core/services/user-concepts.service';
import { OdontogramComponent } from './odontogram.component';

const response = <T>(data: T): ApiResponse<T> => ({
  success: true,
  message: 'OK',
  data,
  errors: null,
  requestId: 'test-request',
});

const chart: Odontogram = {
  id: 10,
  patientId: 7,
  dentition: 'ADULT',
  title: 'Inicial',
  author: { userId: 1, name: 'Doctora' },
  occurredAt: '2026-10-08T12:00:00.000Z',
  archivedAt: null,
  createdAt: '2026-10-08T12:00:00.000Z',
  updatedAt: '2026-10-08T12:00:00.000Z',
  findings: [],
};

describe('OdontogramComponent', () => {
  let component: OdontogramComponent;
  let odontograms: jasmine.SpyObj<OdontogramService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<unknown>>;
  let dialogClosed: Subject<void>;
  let catalog: jasmine.SpyObj<UserConceptsService>;
  let treatments: jasmine.SpyObj<TreatmentPlanService>;

  beforeEach(() => {
    odontograms = jasmine.createSpyObj<OdontogramService>('OdontogramService', [
      'list', 'get', 'update', 'create', 'archive', 'restore', 'link', 'unlink', 'createTreatment', 'planPreview', 'createPlan',
    ]);
    odontograms.list.and.returnValue(of(response({
      total: 1, page: 1, perPage: 100, totalPages: 1, results: [chart],
    })));
    odontograms.get.and.returnValue(of(response(chart)));
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialogRef = jasmine.createSpyObj<MatDialogRef<unknown>>('MatDialogRef', ['afterClosed', 'close']);
    dialogClosed = new Subject<void>();
    dialogRef.afterClosed.and.returnValue(dialogClosed.asObservable());
    dialogRef.close.and.callFake(() => dialogClosed.next());
    dialog.open.and.returnValue(dialogRef);
    catalog = jasmine.createSpyObj('UserConceptsService', ['listAllUserConcepts']);
    catalog.listAllUserConcepts.and.returnValue(of([]));
    treatments = jasmine.createSpyObj('TreatmentPlanService', ['listPatientTreatments']);
    treatments.listPatientTreatments.and.returnValue(of(response({ total: 0, page: 1, perPage: 10, totalPages: 0, results: [] })));
    component = new OdontogramComponent(
      { paramMap: of(convertToParamMap({ id: '7' })) } as ActivatedRoute,
      jasmine.createSpyObj<Router>('Router', ['navigate']),
      odontograms,
      treatments,
      snackBar,
      dialog,
      catalog,
    );
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('loads the patient chart and saves a structured finding', () => {
    expect(odontograms.list).toHaveBeenCalledWith(7, 1);
    expect(component.chart?.id).toBe(10);

    component.selectTooth('16');
    component.setCondition('CARIES');
    component.surface = 'OCCLUSAL_INCISAL';
    component.notes = ' Lesión visible ';
    component.saveFinding();

    expect(component.dirty).toBeTrue();
    expect(component.draftFindings).toEqual([{
      toothCode: '16', condition: 'CARIES', surface: 'OCCLUSAL_INCISAL', notes: 'Lesión visible',
    }]);

    const finding: OdontogramFinding = {
      ...component.draftFindings[0], id: 21, odontogramId: 10,
      treatmentPlanItemIds: [], treatmentPlanItems: [],
      createdAt: chart.createdAt, updatedAt: chart.updatedAt,
    };
    odontograms.update.and.returnValue(of(response({ ...chart, findings: [finding] })));
    component.saveChanges();

    expect(odontograms.update).toHaveBeenCalledWith(10, 'Inicial', [{
      toothCode: '16', condition: 'CARIES', surface: 'OCCLUSAL_INCISAL', notes: 'Lesión visible',
    }]);
    expect(component.dirty).toBeFalse();
    expect(component.selectedToothCode).toBe('16');
  });

  it('rejects an exclusive condition when the same tooth has another finding', () => {
    component.selectTooth('16');
    component.saveFinding();
    component.setCondition('HEALTHY');
    component.saveFinding();

    expect(component.draftFindings.length).toBe(1);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Una pieza sana, ausente o sin erupcionar no admite otros hallazgos.',
      'Cerrar',
      { duration: 4500 },
    );
  });

  it('links an existing treatment item to a saved finding', () => {
    const finding: OdontogramFinding = {
      id: 21, odontogramId: 10, toothCode: '16', condition: 'CARIES',
      surface: 'OCCLUSAL_INCISAL', notes: null,
      treatmentPlanItemIds: [], treatmentPlanItems: [],
      createdAt: chart.createdAt, updatedAt: chart.updatedAt,
    };
    component.chart = { ...chart, findings: [finding] };
    component.selectTooth('16');
    component.linkingFindingId = finding.id;
    odontograms.link.and.returnValue(of(response({
      ...chart,
      findings: [{ ...finding, treatmentPlanItemIds: [9], treatmentPlanItems: [{
        id: 9, treatmentPlanId: 3, userConceptId: null, name: 'Obturación', status: TreatmentPlanItemStatus.PENDING,
      }] }],
    })));

    component.linkItem(9);

    expect(odontograms.link).toHaveBeenCalledWith(10, 21, 9);
    expect(component.chart?.findings[0].treatmentPlanItemIds).toEqual([9]);
    expect(component.selectedToothCode).toBe('16');
    expect(component.linkingFindingId).toBeNull();
  });

  it('shows all findings initially and filters only when a tooth is selected', () => {
    component.draftFindings = [
      { toothCode: '11', condition: 'CARIES', surface: null, notes: null },
      { toothCode: '16', condition: 'RESTORATION', surface: null, notes: null },
    ];
    expect(component.selectedToothCode).toBe('');
    expect(component.selectedFindings.length).toBe(2);
    component.selectTooth('16');
    expect(component.selectedFindings.map(record => record.finding.toothCode)).toEqual(['16']);
    component.selectTooth('');
    expect(component.selectedFindings.length).toBe(2);
  });

  it('edits the correct tooth from the unfiltered list without changing the filter', () => {
    component.draftFindings = [
      { toothCode: '11', condition: 'CARIES', surface: null, notes: null },
      { toothCode: '16', condition: 'RESTORATION', surface: 'MESIAL', notes: 'Nota inicial' },
    ];
    component.editFinding(1);
    expect(dialog.open).toHaveBeenCalled();
    expect(component.findingToothCode).toBe('16');
    component.notes = 'Nota actualizada';
    component.saveFinding();
    expect(component.draftFindings[1].notes).toBe('Nota actualizada');
    expect(component.draftFindings[1].toothCode).toBe('16');
    expect(component.selectedToothCode).toBe('');
    expect(component.dirty).toBeTrue();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('prefills the selected tooth and discards cancelled dialog input', () => {
    component.selectTooth('16');
    component.openFindingDialog();
    expect(component.findingToothCode).toBe('16');
    component.notes = 'Nota sin confirmar';
    dialogClosed.next();
    expect(component.draftFindings).toEqual([]);
    expect(component.dirty).toBeFalse();
    expect(component.notes).toBe('');
  });

  it('does not overwrite unsaved findings by linking a treatment', () => {
    component.linkingFindingId = 21;
    component.dirty = true;
    component.linkItem(9);
    expect(odontograms.link).not.toHaveBeenCalled();
    expect(component.dirty).toBeTrue();
  });

  const savedFinding = (): OdontogramFinding => ({ id: 21, odontogramId: 10, toothCode: '16', condition: 'CARIES', surface: 'MESIAL', notes: null, treatmentPlanItemIds: [], treatmentPlanItems: [], createdAt: chart.createdAt, updatedAt: chart.updatedAt });
  const candidate = (id: number, subtotal = '250.00'): OdontogramPlanCandidate => ({ treatmentId: id, treatmentPlanId: null, userConceptId: 5, name: 'Resina', tooth: '16', area: 'MESIAL', notes: null, clinicalStatus: TreatmentPlanItemStatus.PENDING, quantity: '1.00', unitPrice: subtotal, subtotal, eligible: true, revision: 'a'.repeat(64), reason: null, findings: [{ findingId: 21, toothCode: '16', condition: 'CARIES', surface: 'MESIAL' }] });

  it('opens a review without automatically selecting treatments or creating a plan', () => {
    odontograms.planPreview.and.returnValue(of(response({ odontogramId: 10, patientId: 7, title: 'Inicial', archived: false, treatments: [candidate(9)] })));
    component.openPlanReview();
    expect(odontograms.planPreview).toHaveBeenCalledWith(10); expect(component.planSelected.size).toBe(0); expect(component.planReviewed).toBeFalse(); expect(odontograms.createPlan).not.toHaveBeenCalled();
  });
  it('selects only eligible treatments and requires review of the exact total', () => {
    component.planPreview = { odontogramId: 10, patientId: 7, title: 'Inicial', archived: false, treatments: [candidate(9, '0.10'), candidate(10, '0.20'), { ...candidate(11), eligible: false, reason: 'CHARGE_CONFIRMED' }] };
    component.selectPlanEligible(); expect([...component.planSelected]).toEqual([9, 10]); expect(component.planSubtotal).toBe('0.30');
    component.planTitle = 'Plan'; component.createPlan(); expect(odontograms.createPlan).not.toHaveBeenCalled();
    component.planReviewed = true; component.togglePlanTreatment(component.planPreview.treatments[0], false); expect(component.planReviewed).toBeFalse(); expect(component.planSubtotal).toBe('0.20');
  });
  it('retains the same creation key and reviewed revisions on uncertain retries', () => {
    odontograms.planPreview.and.returnValue(of(response({ odontogramId: 10, patientId: 7, title: 'Inicial', archived: false, treatments: [candidate(9)] })));
    component.openPlanReview(); component.selectPlanEligible(); component.planReviewed = true;
    odontograms.createPlan.and.returnValue(throwError(() => ({ error: { message: 'Reintenta sin duplicar' } })));
    component.createPlan(); component.createPlan();
    expect(odontograms.createPlan.calls.argsFor(0)[1]).toEqual({ title: 'Plan · Inicial', expectedSubtotal: '250.00', treatments: [{ treatmentId: 9, revision: 'a'.repeat(64) }] });
    expect(odontograms.createPlan.calls.argsFor(0)[2]).toBe(odontograms.createPlan.calls.argsFor(1)[2]); expect(component.planError).toBe('Reintenta sin duplicar');
  });
  it('blocks plan creation from unsaved or archived charts and bounds the selection', () => {
    component.dirty = true; component.openPlanReview(); expect(odontograms.planPreview).not.toHaveBeenCalled();
    component.dirty = false; component.chart = { ...chart, archivedAt: chart.createdAt }; component.openPlanReview(); expect(odontograms.planPreview).not.toHaveBeenCalled();
    component.planPreview = { odontogramId: 10, patientId: 7, title: 'Inicial', archived: false, treatments: Array.from({ length: 101 }, (_, i) => candidate(i + 1)) };
    component.selectPlanEligible(); expect(component.planSelected.size).toBe(100); component.togglePlanTreatment(component.planPreview.treatments[100], true); expect(component.planSelected.size).toBe(100);
  });
  it('ignores a review response after its dialog has closed', () => {
    const pending = new Subject<ApiResponse<{ odontogramId: number; patientId: number; title: null; archived: boolean; treatments: OdontogramPlanCandidate[] }>>();
    odontograms.planPreview.and.returnValue(pending.asObservable()); component.openPlanReview(); dialogClosed.next();
    pending.next(response({ odontogramId: 10, patientId: 7, title: null, archived: false, treatments: [candidate(9)] }));
    expect(component.planPreview).toBeNull(); expect(component.planLoading).toBeFalse();
  });

  it('loads catalog and existing patient treatments without requiring a plan', () => {
    const finding = savedFinding(); component.chart = { ...chart, findings: [finding] };
    component.openTreatmentPicker(finding);
    expect(catalog.listAllUserConcepts).toHaveBeenCalled();
    expect(treatments.listPatientTreatments).toHaveBeenCalledWith(7, 1, 10, 'all');
    expect(component.linkingFindingId).toBe(21);
  });

  it('creates a catalog-backed treatment with stable retries and no financial call', () => {
    const finding = savedFinding(); component.chart = { ...chart, findings: [finding] };
    catalog.listAllUserConcepts.and.returnValue(of([Object.assign(new UserConcept(), { id: 5, description: 'Resina', unit_price: 250 })]));
    component.openTreatmentPicker(finding); component.selectedConceptId = 5; component.treatmentQuantity = 2;
    odontograms.createTreatment.and.returnValue(throwError(() => ({ error: { message: 'Conexión interrumpida' } })));
    component.createTreatment(); component.createTreatment();
    expect(odontograms.createTreatment.calls.argsFor(0).slice(0, 3)).toEqual([10, 21, { userConceptId: 5, quantity: '2.00', notes: null }]);
    expect(odontograms.createTreatment.calls.argsFor(0)[3]).toBe(odontograms.createTreatment.calls.argsFor(1)[3]);
    expect(component.pickerError).toBe('Conexión interrumpida');
    expect(component.busy).toBeFalse();
  });

  it('does not create a duplicate catalog treatment for the same finding', () => {
    const finding = savedFinding(); finding.treatmentPlanItems = [{ id: 9, treatmentPlanId: null, userConceptId: 5, name: 'Resina', status: TreatmentPlanItemStatus.PENDING }]; finding.treatmentPlanItemIds = [9];
    component.chart = { ...chart, findings: [finding] };
    catalog.listAllUserConcepts.and.returnValue(of([Object.assign(new UserConcept(), { id: 5, description: 'Resina', unit_price: 250 })]));
    component.openTreatmentPicker(finding); component.selectedConceptId = 5; component.createTreatment();
    expect(component.duplicateCatalogTreatment).toBeTrue(); expect(odontograms.createTreatment).not.toHaveBeenCalled();
  });

  it('does not apply a stale treatment page after selecting another chart', () => {
    const finding = savedFinding(); component.chart = { ...chart, findings: [finding] };
    const pending = new Subject<ReturnType<typeof response<{ total: number; page: number; perPage: number; totalPages: number; results: [] }>>>();
    treatments.listPatientTreatments.and.returnValue(pending.asObservable());
    component.openTreatmentPicker(finding); component.chart = { ...chart, id: 11 }; component.linkingFindingId = null;
    pending.next(response({ total: 100, page: 4, perPage: 10, totalPages: 10, results: [] }));
    expect(component.treatmentPage).toBe(1);
  });

  it('keeps linked findings stable while allowing note edits', () => {
    const finding = savedFinding(); finding.treatmentPlanItemIds = [9];
    component.chart = { ...chart, findings: [finding] }; component.draftFindings = [finding];
    component.removeFinding(0); expect(component.draftFindings).toHaveSize(1);
    component.editFinding(0); component.findingToothCode = '15'; component.saveFinding();
    expect(component.draftFindings[0].toothCode).toBe('16');
    component.findingToothCode = '16'; component.notes = 'Nota nueva'; component.saveFinding();
    expect(component.draftFindings[0].notes).toBe('Nota nueva');
  });

  it('allows viewing archived links but no creation or association changes', () => {
    const finding = savedFinding(); component.chart = { ...chart, archivedAt: chart.createdAt, findings: [finding] };
    component.openTreatmentPicker(finding); component.createTreatment(); component.linkItem(9); component.unlinkItem(21, 9);
    expect(component.linkingFindingId).toBe(21);
    expect(catalog.listAllUserConcepts).not.toHaveBeenCalled();
    expect(odontograms.createTreatment).not.toHaveBeenCalled(); expect(odontograms.link).not.toHaveBeenCalled(); expect(odontograms.unlink).not.toHaveBeenCalled();
  });
});
