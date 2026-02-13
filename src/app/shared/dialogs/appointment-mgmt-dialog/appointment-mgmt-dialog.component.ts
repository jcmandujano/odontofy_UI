import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { Patient } from '../../../core/models/patient.model';
import { QuillModule } from 'ngx-quill';
import 'moment/locale/es';

@Component({
  selector: 'app-appointment-mgmt-dialog',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    QuillModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideMomentDateAdapter(),
  ],
  templateUrl: './appointment-mgmt-dialog.component.html',
  styleUrl: './appointment-mgmt-dialog.component.scss'
})
export class AppointmentMgmtDialogComponent {
  appointmentDate: Date = new Date();
  appointmentNote: string = '';
  patientsList: Patient[] = []
  selectedTime: string = '12:00';
  selectedEndTime: string = '13:00';
  appointmentForm: FormGroup = new FormGroup({});
  selectedPatient: number = 0;
  quillConfig = this.buildQuillConfig();
  constructor(
    public dialogRef: MatDialogRef<AppointmentMgmtDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.appointmentForm = this.fb.group({
      patient: [null, Validators.required],
      reason: [''],
      appointmentDate: [new Date(), Validators.required],
      appointmentPickerTime: [this.selectedTime, Validators.required], //used only for time picker format 'hh:mm'
      appointmentPickerEndTime: [this.selectedEndTime, Validators.required], //used only for time picker format 'hh:mm'
      appointmentTime: [null], //used to store full datetime
      appointmentEndTime: [null], //used to store full datetime
      appointmentNote: ['']
    });

    //Patients list for patient picker
    if (data.patients) {
      this.patientsList = data.patients
    }

    if (data.appointment) {
      console.log('Editing appointment data:', data.appointment.meta.appointment);
      const appointment = data.appointment.meta.appointment

      //we need to extract time in 'hh:mm' format from ISO strings
      const appointmentDateTime = this.getTimeFromISO(appointment.appointment_datetime);
      const appointmentEndDateTime = this.getTimeFromISO(appointment.appointment_end_datetime);

      //´patch values to the form
      this.appointmentForm.patchValue({
        patient: appointment.patient_id,
        appointmentDate: new Date(appointment.appointment_datetime),
        appointmentTime: new Date(appointment.appointment_datetime),
        appointmentEndTime: new Date(appointment.appointment_end_datetime),
        appointmentPickerTime: appointmentDateTime,
        appointmentPickerEndTime: appointmentEndDateTime,
        appointmentNote: appointment.note,
        reason: appointment.reason
      })
    }
  }

  ngOnInit(): void {
    //when date changes
    this.appointmentForm.get('appointmentTime')?.valueChanges.subscribe(time => {
      this.updateAppointmentDateTime();
    });

    // when start time changes
    this.appointmentForm.get('appointmentPickerTime')?.valueChanges.subscribe(time => {
      this.updateAppointmentDateTime();
    });

    //when end time changes
    this.appointmentForm.get('appointmentPickerEndTime')?.valueChanges.subscribe(date => {
      this.updateAppointmentDateTime();
    });
  }

  //used for displaying full name in patient picker
  getFullName(patient: Patient): string {
    return `${patient.name} ${patient.middle_name} ${patient.last_name}`
  }


  onSave(): void {
    if (this.appointmentForm.invalid) return;
    this.dialogRef.close(this.appointmentForm.value);
  }

  cancel() {
    this.dialogRef.close()
  }

  // Extract time in 'hh:mm' format from ISO string
  getTimeFromISO(isoString: string): string {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  // Update appointment start and end DateTime based on selected date and times
  private updateAppointmentDateTime(): void {
    const date: Date = this.appointmentForm.get('appointmentDate')?.value;
    const startTime: string = this.appointmentForm.get('appointmentPickerTime')?.value;
    const endTime: string = this.appointmentForm.get('appointmentPickerEndTime')?.value;

    if (!date || !startTime || !endTime) return;

    const startDateTime = this.combineDateAndTime(date, startTime);    
    const endDateTime = this.combineDateAndTime(date, endTime);

    //we always add one hour to end time on start time change
    endDateTime.setHours(startDateTime.getHours() + 1);
    const appointmentEndDateTime = this.getTimeFromISO(endDateTime.toISOString());

    //patch the end time picker if start time changed
    this.appointmentForm.patchValue({
      appointmentPickerEndTime: appointmentEndDateTime
    }, { emitEvent: false });

    // Si quieres guardarlo dentro del form:
    this.appointmentForm.patchValue({
      appointmentTime: startDateTime,
      appointmentEndTime: endDateTime
    }, { emitEvent: false });
  }


  // Combine date and time into a single Date object
  combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }

  // Configuración básica del editor Quill
  buildQuillConfig(): object {
    return {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],  // Tamaño de encabezado
        ['bold', 'italic', 'underline', 'strike'],  // Negrita, cursiva, subrayado y tachado
        [{ 'color': [] }],    // Color de texto y fondo
        [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Listas ordenadas y desordenadas
        [{ 'indent': '-1' }, { 'indent': '+1' }],   // Disminuir/aumentar sangría
        [{ 'align': [] }],                         // Alineación de texto
        ['blockquote'],              // Cita en bloque y bloque de código
        ['clean']                                  // Botón para limpiar el formato
      ],
      scrollingContainer: 'html',                   // Contenedor con scroll
      bounds: 'self'                               // Limitar el editor dentro de un área

    }
  }
}
