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
      currentBalance: '125.50'
    }], { pagination: { page: 2, pageSize: 25, total: 51, totalPages: 3 } }));

    expect(patient?.middle_name).toBe('');
    expect(patient?.debt).toBe(125.5);
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
      changeReason: 'Archivado solicitado desde el expediente clinico'
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
