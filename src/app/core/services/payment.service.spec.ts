import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PaymentService } from './payment.service';
import { Payment } from '../models/payment.model';

describe('Catalog payments', () => {
  let service: PaymentService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PaymentService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('sends catalog IDs and quantities without client-defined prices, reusing the supplied key', () => {
    const payment = new Payment({ payment_date: '2026-11-12', income: 400, discount: 0, concepts: [{ conceptId: 7, quantity: 1, paymentMethod: 'CASH', unitPrice: 1000 }] });
    for (let attempt = 0; attempt < 2; attempt++) {
      service.createPayment(3, payment, 'same-operation').subscribe();
      const req = http.expectOne(r => r.url.endsWith('/patients/3/billing-records'));
      expect(req.request.headers.get('Idempotency-Key')).toBe('same-operation');
      expect(req.request.body).toEqual({ occurredOn: '2026-11-12', discount: '0.00', amountReceived: '400.00', paymentMethod: 'CASH', items: [{ conceptId: 7, quantity: 1 }] });
      req.flush({ data: null });
    }
  });
  it('adds only received money to an existing record without sending services again', () => {
    service.createInstallment(3, 9, { occurredOn: '2026-11-12', amountReceived: '600.00', paymentMethod: 'CASH' }, 'same-installment').subscribe();
    const req = http.expectOne(r => r.url.endsWith('/patients/3/billing-records/9/installments'));
    expect(req.request.headers.get('Idempotency-Key')).toBe('same-installment');
    expect(req.request.body).toEqual({ occurredOn: '2026-11-12', amountReceived: '600.00', paymentMethod: 'CASH' });
    req.flush({ data: null });
  });
  it('keeps installment origin and descriptions when the page constructs Payment instances', () => {
    let result: Payment | undefined;
    service.listPayments(3).subscribe(response => result = new Payment(response.data!.results[0]));
    http.expectOne(r => r.url.endsWith('/patients/3/billing-records')).flush({ data: [{ id: 10, patientId: 3, sourceBillingRecordId: 9, sourceDescription: 'Resina', recordKind: 'LEGACY', occurredOn: '2026-11-12', subtotal: '0.00', discount: '0.00', total: '0.00', amountReceived: '600.00', balanceChange: '-600.00', balanceAfter: '0.00', paymentMethod: 'CASH', items: [] }] });
    expect(result?.sourceBillingRecordId).toBe(9);
    expect(result?.displayConcepts).toBe('Abono al registro #9: Resina');
  });
});
