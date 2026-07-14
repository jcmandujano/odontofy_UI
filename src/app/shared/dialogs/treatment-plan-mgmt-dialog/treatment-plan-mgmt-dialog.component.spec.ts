import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentPlanMgmtDialogComponent } from './treatment-plan-mgmt-dialog.component';

describe('TreatmentPlanMgmtDialogComponent', () => {
  let component: TreatmentPlanMgmtDialogComponent;
  let fixture: ComponentFixture<TreatmentPlanMgmtDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentPlanMgmtDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentPlanMgmtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
