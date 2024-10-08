import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentMgmtDialogComponent } from './appointment-mgmt-dialog.component';

describe('AppointmentMgmtDialogComponent', () => {
  let component: AppointmentMgmtDialogComponent;
  let fixture: ComponentFixture<AppointmentMgmtDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentMgmtDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentMgmtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
