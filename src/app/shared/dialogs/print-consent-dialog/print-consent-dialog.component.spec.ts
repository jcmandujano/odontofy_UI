import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintConsentDialogComponent } from './print-consent-dialog.component';

describe('PrintConsentDialogComponent', () => {
  let component: PrintConsentDialogComponent;
  let fixture: ComponentFixture<PrintConsentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintConsentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintConsentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
