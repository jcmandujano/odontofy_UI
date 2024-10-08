import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolutionNotesComponent } from './evolution-notes.component';

describe('EvolutionNotesComponent', () => {
  let component: EvolutionNotesComponent;
  let fixture: ComponentFixture<EvolutionNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolutionNotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolutionNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
