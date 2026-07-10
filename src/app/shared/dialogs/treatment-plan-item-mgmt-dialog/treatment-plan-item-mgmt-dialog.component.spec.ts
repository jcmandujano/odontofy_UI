import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentPlanItemMgmtDialogComponent } from './treatment-plan-item-mgmt-dialog.component';

describe('TreatmentPlanItemMgmtDialogComponent', () => {
  let component: TreatmentPlanItemMgmtDialogComponent;
  let fixture: ComponentFixture<TreatmentPlanItemMgmtDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentPlanItemMgmtDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentPlanItemMgmtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
