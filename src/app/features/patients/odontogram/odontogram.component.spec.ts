import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response.model';
import { Odontogram, OdontogramFinding } from '../../../core/models/odontogram.model';
import { OdontogramService } from '../../../core/services/odontogram.service';
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
    component = new OdontogramComponent(
      { paramMap: of(convertToParamMap({ id: '7' })) } as ActivatedRoute,
      odontograms,
      snackBar,
      dialog,
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

  const savedFinding = (): OdontogramFinding => ({ id: 21, odontogramId: 10, toothCode: '16', condition: 'CARIES', surface: 'MESIAL', notes: null, treatmentPlanItemIds: [], treatmentPlanItems: [], createdAt: chart.createdAt, updatedAt: chart.updatedAt });

  it('keeps linked findings stable while allowing note edits', () => {
    const finding = savedFinding(); finding.treatmentPlanItemIds = [9];
    component.chart = { ...chart, findings: [finding] }; component.draftFindings = [finding];
    component.removeFinding(0); expect(component.draftFindings).toHaveSize(1);
    component.editFinding(0); component.findingToothCode = '15'; component.saveFinding();
    expect(component.draftFindings[0].toothCode).toBe('16');
    component.findingToothCode = '16'; component.notes = 'Nota nueva'; component.saveFinding();
    expect(component.draftFindings[0].notes).toBe('Nota nueva');
  });


});
