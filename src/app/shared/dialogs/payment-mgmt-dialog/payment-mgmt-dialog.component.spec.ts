import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMgmtDialogComponent } from './payment-mgmt-dialog.component';

describe('PaymentMgmtDialogComponent', () => {
  let component: PaymentMgmtDialogComponent;
  let fixture: ComponentFixture<PaymentMgmtDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMgmtDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMgmtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
