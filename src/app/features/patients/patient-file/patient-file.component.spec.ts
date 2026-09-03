import { ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { Patient } from '../../../core/models/patient.model';
import { PacientesService } from '../../../core/services/patient.service';
import { PatientFileComponent } from './patient-file.component';

describe('PatientFileComponent', () => {
  let component: PatientFileComponent;
  let patientsService: jasmine.SpyObj<PacientesService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    patientsService = jasmine.createSpyObj<PacientesService>('PacientesService', ['createPatient']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    component = new PatientFileComponent(
      { nativeElement: {} } as ElementRef,
      patientsService,
      router,
      {} as ActivatedRoute,
      {} as Location,
      snackBar
    );
  });

  it('reports required patient fields one at a time in visual order', () => {
    const requiredFields = [
      ['name', 'Ada', 'Ingresa el nombre del paciente.'],
      ['middle_name', 'Lovelace', 'Ingresa el apellido paterno del paciente.'],
      ['last_name', 'Byron', 'Ingresa el apellido materno del paciente.'],
      ['date_of_birth', new Date(1990, 0, 1), 'Ingresa la fecha de nacimiento del paciente.'],
      ['phone', '5512345678', 'Ingresa el teléfono del paciente.'],
      ['email', 'ada@example.com', 'Ingresa el correo electrónico del paciente.']
    ] as const;

    for (const [controlName, validValue, expectedMessage] of requiredFields) {
      component.crearPaciente();
      expect(snackBar.open.calls.mostRecent().args[0]).toBe(expectedMessage);
      expect(patientsService.createPatient).not.toHaveBeenCalled();
      component.crearPacientesForm.get(controlName)?.setValue(validValue);
    }
  });

  it('navigates to the patient list after creating a valid patient', () => {
    component.crearPacientesForm.patchValue({
      name: 'Ada',
      middle_name: 'Lovelace',
      last_name: 'Byron',
      date_of_birth: new Date(1990, 0, 1),
      phone: '5512345678',
      email: 'ada@example.com'
    });
    patientsService.createPatient.and.returnValue(of({
      success: true,
      message: 'Paciente creado',
      data: { id: 7 } as Patient,
      errors: null,
      requestId: 'request-1'
    }));

    component.crearPaciente();

    expect(patientsService.createPatient).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/patient-list']);
    expect(component.spinner).toBeFalse();
  });
});
