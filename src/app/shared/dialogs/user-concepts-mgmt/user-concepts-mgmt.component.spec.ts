import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConceptsMgmtComponent } from './user-concepts-mgmt.component';

describe('UserConceptsMgmtComponent', () => {
  let component: UserConceptsMgmtComponent;
  let fixture: ComponentFixture<UserConceptsMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserConceptsMgmtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserConceptsMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
