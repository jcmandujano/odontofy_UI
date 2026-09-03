import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { AppointmentMgmtDialogComponent } from './appointment-mgmt-dialog.component';

describe('AppointmentMgmtDialogComponent', () => {
  let dialogRef: jasmine.SpyObj<MatDialogRef<AppointmentMgmtDialogComponent>>;
  let component: AppointmentMgmtDialogComponent;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    component = new AppointmentMgmtDialogComponent(dialogRef, new FormBuilder(), { patients: [] });
    component.ngOnInit();
  });

  it('initializes the complete datetimes when the default date and times are kept', () => {
    component.appointmentForm.patchValue({ patient: 2, reason: 'Revisión' });

    component.onSave();

    const result = dialogRef.close.calls.mostRecent().args[0];
    expect(result.appointmentTime).toEqual(jasmine.any(Date));
    expect(result.appointmentEndTime).toEqual(jasmine.any(Date));
    expect(result.appointmentTime.getFullYear()).not.toBe(1970);
    expect(result.appointmentEndTime.getTime() - result.appointmentTime.getTime()).toBe(60 * 60 * 1000);
  });

  it('keeps a custom end time instead of replacing it with the default duration', () => {
    component.appointmentForm.patchValue({ appointmentPickerTime: '14:30' });
    component.appointmentForm.patchValue({ appointmentPickerEndTime: '16:00' });

    expect(component.appointmentForm.value.appointmentPickerEndTime).toBe('16:00');
    expect(component.getTimeFromISO(component.appointmentForm.value.appointmentEndTime.toISOString())).toBe('16:00');
  });

  it('does not save when the end time is not after the start time', () => {
    component.appointmentForm.patchValue({
      patient: 2,
      appointmentPickerTime: '14:30',
      appointmentPickerEndTime: '14:00'
    });

    component.onSave();

    expect(component.appointmentForm.get('appointmentPickerEndTime')?.hasError('endBeforeStart')).toBeTrue();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
