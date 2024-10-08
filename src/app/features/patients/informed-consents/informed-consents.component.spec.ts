import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformedConsentsComponent } from './informed-consents.component';

describe('InformedConsentsComponent', () => {
  let component: InformedConsentsComponent;
  let fixture: ComponentFixture<InformedConsentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformedConsentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformedConsentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
