import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignedConsentMgmtDialogComponent } from './signed-consent-mgmt-dialog.component';

describe('SignedConsentMgmtDialogComponent', () => {
  let component: SignedConsentMgmtDialogComponent;
  let fixture: ComponentFixture<SignedConsentMgmtDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignedConsentMgmtDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignedConsentMgmtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
