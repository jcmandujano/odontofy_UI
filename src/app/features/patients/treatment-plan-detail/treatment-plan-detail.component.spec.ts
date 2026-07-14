import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentPlanDetailComponent } from './treatment-plan-detail.component';

describe('TreatmentPlanDetailComponent', () => {
  let component: TreatmentPlanDetailComponent;
  let fixture: ComponentFixture<TreatmentPlanDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentPlanDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentPlanDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
