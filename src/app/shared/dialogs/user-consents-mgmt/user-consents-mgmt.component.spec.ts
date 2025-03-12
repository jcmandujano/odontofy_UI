import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConsentsMgmtComponent } from './user-consents-mgmt.component';

describe('UserConsentsMgmtComponent', () => {
  let component: UserConsentsMgmtComponent;
  let fixture: ComponentFixture<UserConsentsMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserConsentsMgmtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserConsentsMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
