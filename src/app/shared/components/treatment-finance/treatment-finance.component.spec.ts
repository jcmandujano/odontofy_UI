import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { TreatmentChargeRow, TreatmentChargeService } from '../../../core/services/treatment-charge.service';
import { TreatmentFinanceComponent } from './treatment-finance.component';

describe('TreatmentFinanceComponent', () => {
  let service: jasmine.SpyObj<TreatmentChargeService>;
  let component: TreatmentFinanceComponent;
  const row: TreatmentChargeRow = { treatmentId: 7, treatmentPlanId: null, name: 'Restauración', clinicalStatus: 'PENDING', catalogLinked: true, chargeId: null, subtotal: '1000.00', discount: '0.00', total: '1000.00', paid: '0.00', balance: '0.00', financialStatus: 'UNCONFIRMED' };
  beforeEach(() => {
    service = jasmine.createSpyObj('TreatmentChargeService', ['list', 'confirm', 'pay', 'credits', 'applyCredit']);
    service.credits.and.returnValue(of({ success: true, message: 'ok', data: { results: [], total: 0, page: 1, perPage: 10, totalPages: 0 }, meta: { availableCredit: '0.00' }, errors: null, requestId: 'test' }));
    service.list.and.returnValue(of({ success: true, message: 'ok', data: { results: [], total: 0, page: 1, perPage: 10, totalPages: 0 }, errors: null, requestId: 'test' }));
    const closed = new Subject<unknown>();
    const dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue({ afterClosed: () => closed.asObservable(), close: () => closed.next(null) } as unknown as MatDialogRef<unknown>);
    component = new TreatmentFinanceComponent(service, dialog); component.patientId = 9;
  });
  it('keeps quotation and confirmation separate and submits the reviewed net amount', () => {
    component.ngOnChanges();
    expect(service.confirm).not.toHaveBeenCalled();
    component.openConfirm(row); component.discount = 100;
    service.confirm.and.returnValue(of({ success: true, message: 'ok', data: null, errors: null, requestId: 'test' }));
    component.confirm();
    expect(service.confirm).toHaveBeenCalledWith(9, 7, jasmine.any(String), '100.00', '900.00');
  });
  it('does not offer confirmation for unlinked historical or cancelled treatments', () => {
    component.openConfirm({ ...row, catalogLinked: false });
    expect(component.confirming).toBeNull();
    component.openConfirm({ ...row, clinicalStatus: 'CANCELLED' });
    expect(component.confirming).toBeNull();
  });
  it('uses the same idempotency key when retrying an uncertain payment', () => {
    const charged = { ...row, chargeId: 10, balance: '1000.00', financialStatus: 'UNPAID' as const };
    service.pay.and.returnValue(throwError(() => ({ error: { message: 'Conexión interrumpida' } })));
    component.openPay(charged); component.paymentRows[0].paymentAmount = 400;
    component.pay(); component.pay();
    const first = service.pay.calls.argsFor(0); const second = service.pay.calls.argsFor(1);
    expect(first[3]).toEqual([{ chargeId: 10, amount: '400.00' }]);
    expect(first[4]).toBe(second[4]);
    expect(component.dialogError).toBe('Conexión interrumpida');
    expect(component.busy).toBeFalse();
  });
  it('can pay selected charges together and skips paid or unconfirmed rows', () => {
    component.rows = [{ ...row, chargeId: 10, balance: '200.00', financialStatus: 'PARTIAL' }, { ...row, treatmentId: 8, chargeId: 11, balance: '100.00', financialStatus: 'UNPAID' }, row];
    component.toggle(component.rows[0], true); component.toggle(component.rows[1], true);
    component.openPay();
    expect(component.paymentRows.map(item => item.chargeId)).toEqual([10, 11]);
    expect(component.paymentRows.map(item => item.paymentAmount)).toEqual([200, 100]);
  });
  it('requires a catalog-backed treatment for advances and retains its origin on retries', () => {
    component.openAdvance({ ...row, catalogLinked: false });
    expect(component.advanceTreatment).toBeNull();
    component.openAdvance(row); component.advanceAmount = 1200;
    service.pay.and.returnValue(throwError(() => ({ error: { message: 'Retry' } })));
    component.advance(); component.advance();
    expect(service.pay.calls.argsFor(0)[3]).toEqual([]);
    expect(service.pay.calls.argsFor(0)[5]).toEqual({ sourceTreatmentId: 7, amountReceived: '1200.00' });
    expect(service.pay.calls.argsFor(0)[4]).toBe(service.pay.calls.argsFor(1)[4]);
  });
  it('records an excess as credit rather than applying it over a charge balance', () => {
    component.openPay({ ...row, chargeId: 10, balance: '1000.00', financialStatus: 'UNPAID' });
    component.extraAmount = 200;
    service.pay.and.returnValue(throwError(() => ({ error: { message: 'Retry' } })));
    component.pay();
    expect(service.pay.calls.mostRecent().args[3]).toEqual([{ chargeId: 10, amount: '1000.00' }]);
    expect(service.pay.calls.mostRecent().args[5]).toEqual({ sourceTreatmentId: 7, amountReceived: '1200.00' });
  });
  it('applies existing credit without calling payment creation and blocks excess use', () => {
    component.credits = [{ paymentId: 40, treatmentId: 7, treatmentName: 'Restauración', occurredOn: '2026-10-01', amountReceived: '600.00', applied: '0.00', available: '600.00', status: 'POSTED', applications: [] }];
    component.openUseCredit({ ...row, chargeId: 10, balance: '1000.00', financialStatus: 'UNPAID' });
    expect(component.appliedAmount).toBe(600);
    expect(service.pay).not.toHaveBeenCalled();
    service.applyCredit.and.returnValue(throwError(() => ({ error: { message: 'Retry' } })));
    component.applyCredit(); component.applyCredit();
    expect(service.applyCredit.calls.argsFor(0)[3]).toEqual([{ chargeId: 10, amount: '600.00' }]);
    expect(service.applyCredit.calls.argsFor(0)[4]).toBe(service.applyCredit.calls.argsFor(1)[4]);
    component.paymentRows[0].paymentAmount = 601; component.applyCredit();
    expect(service.applyCredit.calls.count()).toBe(2);
  });
});
