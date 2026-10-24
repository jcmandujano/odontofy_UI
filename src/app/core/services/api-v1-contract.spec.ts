import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.model';
import { Payment } from '../models/payment.model';
import { AuthService } from './auth.service';
import { EvolutionNoteService } from './evolution-note.service';
import { PacientesService } from './patient.service';
import { PaymentService } from './payment.service';
import { TreatmentPlanService } from './treatment-plan.service';
import { TreatmentChargeService } from './treatment-charge.service';
import { UserConceptsService } from './user-concepts.service';
import { OdontogramService } from './odontogram.service';

const envelope = <T>(data: T, meta?: object) => ({
  success: true,
  message: 'ok',
  data,
  errors: null,
  requestId: 'request-1',
  ...(meta && { meta })
});

describe('API v1 contract adapters', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());
  it('creates an atomic catalog treatment from a saved finding with an idempotency key', () => {
    TestBed.inject(OdontogramService).createTreatment(10, 21, { userConceptId: 5, quantity: '2.00', notes: null }, 'stable-key').subscribe();
    const request = http.expectOne(`${environment.API_URL}/odontograms/10/findings/21/treatments`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Idempotency-Key')).toBe('stable-key');
    expect(request.request.body).toEqual({ userConceptId: 5, quantity: '2.00', notes: null });
    request.flush(envelope({ odontogram: {}, treatmentId: 9 }));
  });
  it('retains odontogram references when adapting patient treatments', () => {
    const references = [{ odontogramId: 10, findingId: 21, title: 'Inicial', toothCode: '16', condition: 'CARIES', surface: 'MESIAL', archived: false }];
    TestBed.inject(TreatmentPlanService).listPatientTreatments(7).subscribe(response => expect(response.data?.results[0].odontogram_references).toEqual(references));
    const request = http.expectOne(`${environment.API_URL}/patients/7/treatments?page=1&pageSize=10&scope=independent&status=all`);
    request.flush(envelope([{ id: 9, patientId: 7, treatmentPlanId: null, userConceptId: 5, name: 'Resina', quantity: '1.00', unitPrice: '250.00', subtotal: '250.00', status: 'PENDING', odontogramReferences: references }]));
  });

  it('sends a catalog-backed advance without generating charge items', () => {
    TestBed.inject(TreatmentChargeService).pay(9, '2026-10-24', 'CASH', [], 'advance-key', { sourceTreatmentId: 7, amountReceived: '1200.00' }).subscribe();
    const request = http.expectOne(`${environment.API_URL}/patients/9/treatment-payments`);
    expect(request.request.body).toEqual({ occurredOn: '2026-10-24', paymentMethod: 'CASH', allocations: [], sourceTreatmentId: 7, amountReceived: '1200.00' });
    expect(request.request.headers.get('Idempotency-Key')).toBe('advance-key');
    request.flush(envelope({ billingRecordId: 1, amountReceived: '1200.00' }));
  });

  it('applies credit through a separate idempotent operation rather than a new receipt', () => {
    TestBed.inject(TreatmentChargeService).applyCredit(9, 20, '2026-10-24', [{ chargeId: 10, amount: '600.00' }], 'application-key').subscribe();
    const request = http.expectOne(`${environment.API_URL}/patients/9/treatment-credits/20/applications`);
    expect(request.request.body).toEqual({ occurredOn: '2026-10-24', allocations: [{ chargeId: 10, amount: '600.00' }] });
    expect(request.request.headers.get('Idempotency-Key')).toBe('application-key');
    request.flush(envelope({ applicationId: 1, paymentId: 20, amountApplied: '600.00' }));
  });

  it('preserves patient-wide available credit and paginates advance receipts', () => {
    TestBed.inject(TreatmentChargeService).credits(9, 2, 10).subscribe(response => {
      expect(response.data?.total).toBe(11);
      expect(response.meta?.availableCredit).toBe('200.00');
    });
    const request = http.expectOne(`${environment.API_URL}/patients/9/treatment-credits?page=2&pageSize=10`);
    request.flush(envelope([], { availableCredit: '200.00', pagination: { page: 2, pageSize: 10, total: 11, totalPages: 2 } }));
  });

  it('shows advance origin and remaining credit in patient payment history', () => {
    TestBed.inject(PaymentService).listPayments(9).subscribe(response => {
      expect(response.data?.results[0].displayConcepts).toBe('Anticipo: Restauración · disponible $200.00');
    });
    http.expectOne(`${environment.API_URL}/patients/9/billing-records?page=1&pageSize=10`).flush(envelope([{ id: 1, patientId: 9, recordKind: 'TREATMENT_PAYMENT', advanceTreatmentName: 'Restauración', availableCredit: '200.00', occurredOn: '2026-10-24', subtotal: '0.00', total: '0.00', discount: '0.00', amountReceived: '1200.00', balanceChange: '-1200.00', balanceAfter: '-200.00', paymentMethod: 'CASH', items: [], allocations: [] }]));
  });

  it('confirms an explicit treatment charge with a reviewed amount', () => {
    TestBed.inject(TreatmentChargeService).confirm(9, 7, '2026-10-24', '0.00', '1000.00').subscribe();
    const request = http.expectOne(`${environment.API_URL}/patients/9/treatment-charges/7/confirmation`);
    expect(request.request.body).toEqual({ occurredOn: '2026-10-24', discount: '0.00', expectedTotal: '1000.00' });
    request.flush(envelope({ chargeId: 10, treatmentId: 7, total: '1000.00' }));
  });

  it('posts allocations as received money without creating service items again', () => {
    const allocations = [{ chargeId: 10, amount: '400.00' }];
    TestBed.inject(TreatmentChargeService).pay(9, '2026-10-24', 'CASH', allocations, 'receipt-key').subscribe();
    const request = http.expectOne(`${environment.API_URL}/patients/9/treatment-payments`);
    expect(request.request.headers.get('Idempotency-Key')).toBe('receipt-key');
    expect(request.request.body).toEqual({ occurredOn: '2026-10-24', paymentMethod: 'CASH', allocations });
    request.flush(envelope({ billingRecordId: 1, amountReceived: '400.00' }));
  });

  it('preserves treatment receipt descriptions when legacy views rehydrate payments', () => {
    TestBed.inject(PaymentService).listPayments(9).subscribe(response => {
      const receipt = new Payment(response.data?.results[0]);
      expect(receipt.displayConcepts).toBe('Abono: Restauración');
      expect(receipt.debt).toBe(600);
      expect(receipt.total).toBe(0);
    });
    http.expectOne(`${environment.API_URL}/patients/9/billing-records?page=1&pageSize=10`).flush(envelope([{ id: 1, patientId: 9, recordKind: 'TREATMENT_PAYMENT', occurredOn: '2026-10-24', subtotal: '0.00', total: '0.00', discount: '0.00', amountReceived: '400.00', balanceChange: '-400.00', balanceAfter: '600.00', paymentMethod: 'CASH', items: [], allocations: [{ description: 'Restauración', amount: '400.00' }] }]));
  });

  it('requests independent patient treatments with server pagination', () => {
    TestBed.inject(TreatmentPlanService).listPatientTreatments(9, 2, 25).subscribe(response => {
      expect(response.data?.total).toBe(30);
    });
    const request = http.expectOne(req => req.url === `${environment.API_URL}/patients/9/treatments`);
    expect(request.request.params.get('scope')).toBe('independent');
    expect(request.request.params.get('page')).toBe('2');
    request.flush(envelope([], { pagination: { page: 2, pageSize: 25, total: 30, totalPages: 2 } }));
  });

  it('loads catalog pages beyond the first hundred entries', () => {
    let count = 0;
    TestBed.inject(UserConceptsService).listAllUserConcepts().subscribe(items => count = items.length);
    http.expectOne(`${environment.API_URL}/billing-concepts?page=1&pageSize=100`).flush(envelope([{ id: 1, description: 'A', unitPrice: '10.00' }], { pagination: { page: 1, pageSize: 100, total: 101, totalPages: 2 } }));
    http.expectOne(`${environment.API_URL}/billing-concepts?page=2&pageSize=100`).flush(envelope([{ id: 101, description: 'B', unitPrice: '20.00' }], { pagination: { page: 2, pageSize: 100, total: 101, totalPages: 2 } }));
    expect(count).toBe(2);
  });

  it('uses the v1 identity contract and maps the session for existing views', () => {
    let token = '';
    TestBed.inject(AuthService).login('ADA@EXAMPLE.TEST', 'secret').subscribe(response => {
      token = response.data?.token ?? '';
    });

    const request = http.expectOne(`${environment.API_URL}/auth/login`);
    expect(request.request.body).toEqual({ email: 'ADA@EXAMPLE.TEST', password: 'secret' });
    expect(request.request.withCredentials).toBeTrue();
    request.flush(envelope({
      accessToken: 'access-token',
      user: {
        id: 1,
        name: 'Ada',
        middleName: '',
        lastName: 'Lovelace',
        dateOfBirth: null,
        phone: '',
        avatar: '',
        email: 'ada@example.test',
        showFinanceStats: true,
        isGoogleSynced: false
      }
    }));

    expect(token).toBe('access-token');
  });

  it('confirms accounts with the user and token from the email link', () => {
    const token = 'a'.repeat(64);
    TestBed.inject(AuthService).confirmAccount(17, token).subscribe();

    const request = http.expectOne(`${environment.API_URL}/auth/account-verification/confirm`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ userId: 17, token });
    request.flush(envelope(null));
  });

  it('verifies sensitive actions through the authenticated v1 password endpoint', () => {
    TestBed.inject(AuthService).verifyPassword('current-password').subscribe();

    const request = http.expectOne(`${environment.API_URL}/auth/password/verify`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ password: 'current-password' });
    request.flush(envelope({ valid: true }));
  });

  it('maps v1 patient pagination and never sends legacy pagination names', () => {
    let patient: Patient | undefined;
    TestBed.inject(PacientesService).listPatients(2, 25, 'Ada').subscribe(response => {
      patient = response.data?.results[0];
      expect(response.data?.total).toBe(51);
    });

    const request = http.expectOne(req => req.url === `${environment.API_URL}/patients`);
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('25');
    expect(request.request.params.has('limit')).toBeFalse();
    request.flush(envelope([{
      id: 7,
      name: 'Ada',
      middleName: null,
      lastName: 'Lovelace',
      dateOfBirth: '1990-01-01',
      phone: null,
      email: null,
      active: true,
      currentBalance: '125.50',
      createdAt: '2026-08-22T12:00:00.000Z'
    }], { pagination: { page: 2, pageSize: 25, total: 51, totalPages: 3 } }));

    expect(patient?.middle_name).toBe('');
    expect(patient?.debt).toBe(125.5);
    expect(patient?.createdAt).toEqual(new Date('2026-08-22T12:00:00.000Z'));
  });

  it('normalizes the first patient page to the API base', () => {
    TestBed.inject(PacientesService).listPatients(0).subscribe();

    const request = http.expectOne(`${environment.API_URL}/patients?page=1&pageSize=10`);
    expect(request.request.params.get('page')).toBe('1');
    request.flush(envelope([], { pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }));
  });

  it('creates billing records with exact decimals and an idempotency key', () => {
    const payment = new Payment({
      payment_date: '2026-08-22',
      income: 100,
      discount: 5,
      concepts: [{ conceptId: 3, paymentMethod: 'CASH', quantity: 2 }]
    });
    TestBed.inject(PaymentService).createPayment(9, payment).subscribe();

    const request = http.expectOne(`${environment.API_URL}/patients/9/billing-records`);
    expect(request.request.headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/);
    expect(request.request.body).toEqual({
      occurredOn: '2026-08-22',
      discount: '5.00',
      amountReceived: '100.00',
      paymentMethod: 'CASH',
      items: [{ conceptId: 3, quantity: 2 }]
    });
    request.flush(envelope({
      id: 1,
      patientId: 9,
      occurredOn: '2026-08-22',
      subtotal: '200.00',
      discount: '5.00',
      total: '195.00',
      amountReceived: '100.00',
      balanceChange: '95.00',
      balanceAfter: '95.00',
      paymentMethod: 'CASH',
      items: []
    }));
  });

  it('archives evolution notes with the required audit reason', () => {
    TestBed.inject(EvolutionNoteService).deleteNote(4, 8).subscribe();

    const request = http.expectOne(`${environment.API_URL}/patients/4/evolution-notes/8`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({
      changeReason: 'Archivado solicitado desde el expediente clínico'
    });
    request.flush(envelope({
      id: 8,
      patientId: 4,
      treatmentPlanId: null,
      treatmentPlanItemId: null,
      note: 'Nota',
      occurredAt: '2026-08-22T12:00:00.000Z',
      createdAt: '2026-08-22T12:00:00.000Z',
      updatedAt: '2026-08-22T12:00:00.000Z'
    }));
  });
});
