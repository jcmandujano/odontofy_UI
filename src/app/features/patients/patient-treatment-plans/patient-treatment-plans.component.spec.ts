import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientTreatmentPlansComponent } from './patient-treatment-plans.component';

describe('PatientTreatmentPlansComponent', () => {
  let component: PatientTreatmentPlansComponent;
  let fixture: ComponentFixture<PatientTreatmentPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientTreatmentPlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientTreatmentPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
