import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { Patient } from '../../../core/models/patient.model';
import { QuillModule } from 'ngx-quill';
import 'moment/locale/es';

@Component({
  selector: 'app-appointment-mgmt-dialog',
  standalone: true,
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
    {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},
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
  appointmentForm: FormGroup = new FormGroup({});
  
  // Configuración básica del editor Quill
  quillConfig = {
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
    
  };
  constructor(
    public dialogRef: MatDialogRef<AppointmentMgmtDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if(data.patients){
      this.patientsList = data.patients
    }
  } 

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      patient: [null, Validators.required],
      appointmentDate: [null, Validators.required],
      appointmentTime: [this.selectedTime, Validators.required],
      appointmentNote: ['']
    });
  }

  getFullName(patient: Patient): string {
    return `${patient.name} ${patient.middle_name} ${patient.last_name}`
  }
  
  onTimeChange(event: any): void {
     this.selectedTime = event;
  }

  onSave(): void {
    if (this.appointmentForm.valid) {
      const appointmentData = this.appointmentForm.value;
      console.log('Datos de la cita:', appointmentData);
      //enviamos al padre la informacion generada en el dialogo
      this.dialogRef.close(appointmentData);
    }
  }

  cancel(){
    this.dialogRef.close()
  }
}
