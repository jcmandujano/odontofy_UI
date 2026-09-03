import { Component, ElementRef, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { PacientesService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';
import moment from 'moment';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Location } from '@angular/common';

@Component({
  selector: 'app-patient-file',
  imports: [
    MatSelectModule,
    MatRadioModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    NavBarComponent,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './patient-file.component.html',
  styleUrl: './patient-file.component.scss'
})
export class PatientFileComponent {
  crearPacientesForm: FormGroup
  patient: Patient = new Patient();
  spinner = false
  pacienteId!: number; //if this value exist, we enable update mode
  constructor(private elementRef: ElementRef,
    private pacientesService: PacientesService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private snackBar: MatSnackBar) {
    this.crearPacientesForm = this.buildPacientesForm()
  }

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : 0;
    if (this.pacienteId) {
      this.spinner = true
      this.pacientesService.findPatient(this.pacienteId).subscribe(response => {
        if (response.data) {
          this.patchValuesToEdit(response.data)
        }
        this.spinner = false
      }, (error) => {
        this.spinner = false
        console.log('ERROR', error.error.message)
        this.openSnackbar(`Ocurrió un error: ${error.error.message}`, 'Aceptar')
      })
    }
  }

  //this changes background on load
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
  }

  patchValuesToEdit(paciente: Patient) {
    // console.log('QUE FECHA TRAES', this.calculaEdad(new Date(paciente.fecha_nacimiento).toISOString()))
    this.crearPacientesForm.patchValue({
      name: paciente.name,
      middle_name: paciente.middle_name,
      last_name: paciente.last_name,
      date_of_birth: paciente.date_of_birth,
      age: this.calculaEdad(new Date(paciente.date_of_birth).toISOString()),
      gender: paciente.gender,
      occupation: paciente.occupation,
      marital_status: paciente.marital_status,
      email: paciente.email,
      phone: paciente.phone,
      address: paciente.address,
      rfc: paciente.rfc,
      reason_for_consultation: paciente.reason_for_consultation,
      emergency_contact_name: paciente.emergency_contact_name,
      emergency_contact_relationship: paciente.emergency_contact_relationship,
      emergency_contact_phone: paciente.emergency_contact_phone,
      family_medical_history: paciente.family_medical_history,
      personal_medical_history: paciente.personal_medical_history,
    })
  }

  //guarda la informacion del paciente
  crearPaciente() {
    this.crearPacientesForm.markAllAsTouched()
    if (this.crearPacientesForm.invalid) {
      this.showFirstValidationError()
      return
    }

    this.spinner = true
    this.patient = this.crearPacientesForm.value
    this.pacientesService.createPatient(this.patient).subscribe(data => {
      this.openSnackbar('La información se guardó correctamente', 'Aceptar')
      this.router.navigate(['/patient-list'])
      this.spinner = false
    }, (error) => {
      this.spinner = false
      console.log('ERROR', error)
      this.openSnackbar(`Ocurrió un error: ${error.error.message}`, 'Aceptar')
    })
  }

  actualizarPaciente() {
    if (this.crearPacientesForm.valid) {
      this.spinner = true
      this.patient = this.crearPacientesForm.value
      this.pacientesService.updatePatient(this.pacienteId, this.patient).subscribe(data => {
        this.openSnackbar('La información se actualizó correctamente', 'Aceptar')
        this.spinner = false
      }, (error) => {
        this.spinner = false
        console.log('ERROR', error)
        this.openSnackbar(`Ocurrió un error: ${error.error.message}`, 'Aceptar')
      })
    }
  }

  //hook al cambiar el valor de la fecha de nacimiento
  onDateChange(eventChange: MatDatepickerInputEvent<Date>) {
    const edad = this.calculaEdad(moment(eventChange.value).format())
    if (edad) {
      this.crearPacientesForm.patchValue({ age: edad })
    }
  }

  //calcula la edad en funcion de la decha de nacimiento
  calculaEdad(dateString: string): number {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  //mostramos el error de email por valido o por formato
  getEmailErrorMessage() {
    if (this.crearPacientesForm.controls['email'].hasError('required')) {
      return 'Debes ingresar el email';
    }

    return this.crearPacientesForm.controls['email'].hasError('email') ? 'El correo electrónico no es válido' : '';
  }

  //mostramos el error de telefono por valido o por formato
  getPhoneErrorMessage() {
    if (this.crearPacientesForm.controls['phone'].hasError('required')) {
      return 'Debes ingresar el email';
    }

    return this.crearPacientesForm.controls['phone'].hasError('pattern') ? 'El teléfono no es válido' : '';
  }

  private showFirstValidationError(): void {
    const validations = [
      { name: 'name', required: 'Ingresa el nombre del paciente.' },
      { name: 'middle_name', required: 'Ingresa el apellido paterno del paciente.' },
      { name: 'last_name', required: 'Ingresa el apellido materno del paciente.' },
      { name: 'date_of_birth', required: 'Ingresa la fecha de nacimiento del paciente.' },
      {
        name: 'phone',
        required: 'Ingresa el teléfono del paciente.',
        invalid: 'Ingresa un teléfono válido.'
      },
      {
        name: 'email',
        required: 'Ingresa el correo electrónico del paciente.',
        invalid: 'Ingresa un correo electrónico válido.'
      }
    ] as const

    for (const validation of validations) {
      const control = this.crearPacientesForm.get(validation.name)
      if (!control?.invalid) continue

      const message = control.hasError('required')
        ? validation.required
        : 'invalid' in validation
          ? validation.invalid
          : validation.required

      this.openSnackbar(message, 'Ok')
      return
    }
  }

  buildPacientesForm(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      middle_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required),
      age: new FormControl({ value: '', disabled: true }),
      date_of_birth: new FormControl('', Validators.required),
      gender: new FormControl(''),
      occupation: new FormControl(''),
      marital_status: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern('[- +()0-9]+')]),
      address: new FormControl(''),
      rfc: new FormControl(''),
      reason_for_consultation: new FormControl(''),
      emergency_contact_name: new FormControl(''),
      emergency_contact_relationship: new FormControl(''),
      emergency_contact_phone: new FormControl(''),
      family_medical_history: new FormControl(''),
      personal_medical_history: new FormGroup({
        bajoTratamientoMedico: new FormGroup({//pasar todo esto a inglés
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        intervencionQuirurgica: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        consumeDrogas: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        problemasPresion: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        hepatitis: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        vih: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        ets: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        problemaCorazon: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        fiebreReumatica: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        asma: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        diabetes: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        ulceraGastrica: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        tiroides: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        alergias: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        epilepsia: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        gastritis: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        embarazo: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        otros: new FormGroup({
          comentarios: new FormControl('')
        })
      })
    })
  }

  cancel() {
    this.location.back();
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
