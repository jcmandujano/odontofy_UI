import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolutionNoteMgmtDialogComponent } from './evolution-note-mgmt-dialog.component';

describe('EvolutionNoteMgmtDialogComponent', () => {
  let component: EvolutionNoteMgmtDialogComponent;
  let fixture: ComponentFixture<EvolutionNoteMgmtDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolutionNoteMgmtDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolutionNoteMgmtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
