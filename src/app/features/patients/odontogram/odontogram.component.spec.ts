import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response.model';
import { Odontogram, OdontogramFinding } from '../../../core/models/odontogram.model';
import { TreatmentPlanItemStatus } from '../../../core/models/treatment-plan.model';
import { OdontogramService } from '../../../core/services/odontogram.service';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
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

  beforeEach(() => {
    odontograms = jasmine.createSpyObj<OdontogramService>('OdontogramService', [
      'list', 'get', 'update', 'create', 'archive', 'restore', 'link', 'unlink',
    ]);
    odontograms.list.and.returnValue(of(response({
      total: 1, page: 1, perPage: 100, totalPages: 1, results: [chart],
    })));
    odontograms.get.and.returnValue(of(response(chart)));
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    component = new OdontogramComponent(
      { paramMap: of(convertToParamMap({ id: '7' })) } as ActivatedRoute,
      jasmine.createSpyObj<Router>('Router', ['navigate']),
      odontograms,
      jasmine.createSpyObj<TreatmentPlanService>('TreatmentPlanService', ['listTreatmentPlansByPatient', 'getTreatmentPlanDetail']),
      snackBar,
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
});
