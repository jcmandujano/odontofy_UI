import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConceptsComponent } from './user-concepts.component';

describe('UserConceptsComponent', () => {
  let component: UserConceptsComponent;
  let fixture: ComponentFixture<UserConceptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserConceptsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserConceptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
