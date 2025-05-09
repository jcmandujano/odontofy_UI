import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmWithPasswordDialogComponent } from './confirm-with-password-dialog.component';

describe('ConfirmWithPasswordDialogComponent', () => {
  let component: ConfirmWithPasswordDialogComponent;
  let fixture: ComponentFixture<ConfirmWithPasswordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmWithPasswordDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmWithPasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
