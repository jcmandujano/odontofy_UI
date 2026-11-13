import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { EvolutionNote } from '../../../core/models/evolution-note.model';
import { EvolutionNoteMgmtDialogComponent } from './evolution-note-mgmt-dialog.component';

describe('Evolution note capture', () => {
  it('accepts the Moment date used by the application adapter', () => {
    const ref = jasmine.createSpyObj<MatDialogRef<EvolutionNoteMgmtDialogComponent>>('Dialog', ['close']);
    const dialog = new EvolutionNoteMgmtDialogComponent(ref, null);
    dialog.creationDate = moment.utc('2026-11-12T12:00:00Z') as unknown as Date;
    dialog.noteContent = '<p>Atención de urgencia</p>';
    dialog.onSave();
    expect(ref.close).toHaveBeenCalledWith(jasmine.objectContaining({ creationDate: '2026-11-12T12:00:00.000Z', treatment_plan_id: null, markTreatmentAsCompleted: false }));
  });

  it('retains old clinical associations without enabling changes or completing treatments', () => {
    const ref = jasmine.createSpyObj<MatDialogRef<EvolutionNoteMgmtDialogComponent>>('Dialog', ['close']);
    const note = Object.assign(new EvolutionNote(), { createdAt: '2026-11-11T12:00:00Z', note: '<p>Previo</p>', treatment_plan_id: 3, treatment_plan_item_id: 9 });
    const dialog = new EvolutionNoteMgmtDialogComponent(ref, { note });
    dialog.noteContent = '<p>Corrección</p>';
    dialog.onSave();
    expect(ref.close).toHaveBeenCalledWith(jasmine.objectContaining({ treatment_plan_id: 3, treatment_plan_item_id: 9, markTreatmentAsCompleted: false }));
  });
});
