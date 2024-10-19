import { Component, ElementRef } from '@angular/core';
import { CalendarEvent, CalendarModule, CalendarUtils, DateAdapter, CalendarA11y, CalendarDateFormatter, CalendarEventTitleFormatter, CalendarView, DAYS_OF_WEEK, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { startOfDay, isSameDay, isSameMonth, setHours, setMinutes } from 'date-fns';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { registerLocaleData } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EventColor } from 'calendar-utils';
import { Subject } from 'rxjs';
import localeEs from '@angular/common/locales/es';

import { AppointmentMgmtDialogComponent } from '../../../shared/dialogs/appointment-mgmt-dialog/appointment-mgmt-dialog.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { Patient } from '../../../core/models/patient.model';
import { PacientesService } from '../../../core/services/patient.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';

registerLocaleData(localeEs);

const colors: Record<string, EventColor> = {
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  }
};

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CalendarModule,
    MatProgressSpinnerModule,
    NavBarComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory
    },
    CalendarUtils,
    CalendarA11y,
    CalendarDateFormatter,
    CalendarEventTitleFormatter
  ]
})
export class AgendaComponent {
  viewDate: Date = new Date(); // Asegúrate de que sea el mes actual
  spinner= false
  view: CalendarView = CalendarView.Month;
  locale: string = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  CalendarView = CalendarView;
  refresh = new Subject<void>();
  activeDayIsOpen: boolean = true;
  events: CalendarEvent[] = []
  patientsList: Patient[] = []
  constructor(
    private elementRef: ElementRef,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private patientService: PacientesService,
    private appointmentService: AppointmentService
  ){ }

  ngOnInit(): void {
    this.retrievePatients()
    this.retrieveAppointments()
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument
        .body.style.backgroundColor = '#ffffff';
  }

  retrievePatients(){
    this.spinner = true
    this.patientService.listPatients().subscribe(data=>{
      this.patientsList = data.patients
      this.spinner = false
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  retrieveAppointments(){
    this.spinner = true
    this.appointmentService.listAppointments().subscribe(data=>{
      console.log('APPOINTMENTS', data.appointments)
      this.events = this.transformAppointmentsToEvents(data.appointments);
      console.log('APPOINTMENTS', this.events)
      this.spinner = false
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  newAppointment() { 
    this.launchAppointmentDialog(undefined)
  }

  updateAppointmentStatus(appointment: CalendarEvent): void {
    this.launchAppointmentDialog(appointment)
  }

  buildAppointmentData(appointmentData: any): Appointment { 
    // Convertir appointmentDate a 'YYYY-MM-DD'
    const appointmentDate = new Date(appointmentData.appointmentDate).toISOString().split('T')[0];

    // Asegurarse de que appointmentTime esté en formato 'HH:MM:SS'
    const appointmentTime = appointmentData.appointmentTime.length === 5 
      ? `${appointmentData.appointmentTime}:00`  // Agregar segundos si solo tiene horas y minutos  
      : appointmentData.appointmentTime;

    // Crear instancia de la clase Appointment
    return new Appointment(
      appointmentData.id,
      appointmentData.patient,
      appointmentDate, // Fecha en formato 'YYYY-MM-DD'
      appointmentTime, // Tiempo en formato 'HH:MM:SS'
      appointmentData.appointmentNote,
      'pendiente' // Estado por defecto
    );
  }

  transformAppointmentsToEvents(appointments: Appointment[]): CalendarEvent[] {
    return appointments.map(appointment => {
        // Combinar fecha y hora en formato ISO (YYYY-MM-DDTHH:mm:ss)
        const appointmentDateTime = `${appointment.appointment_date}T${appointment.appointment_time}`;
        const appointmentDate = new Date(appointmentDateTime);

        return {
            id: appointment.id,
            meta: { appointment },
            start: appointmentDate, 
            end: appointmentDate, 
            title: `Cita con paciente: ${this.findPatientNameById(appointment.patient_id)}`,
            color: { ...colors['blue'] },
            actions: this.buildEventActions(appointment.patient_id),
            cssClass: 'action-icons'
        } as CalendarEvent;
    });
}

  launchAppointmentDialog(appointmentEvent?: CalendarEvent ): void {
    const dialogRef = this.dialog.open(AppointmentMgmtDialogComponent, {
      width: '40vw',
      height: '80vh',
      data: {
        patients: this.patientsList,
        appointment: appointmentEvent
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Convertir appointmentDate a 'YYYY-MM-DD'
        const appointment = this.buildAppointmentData(result);
        //si viene informacion de appointmentEvent, quiere decir que es una edicion
        if(appointmentEvent){
          if (appointmentEvent?.id !== undefined) {
            this.updateAppointment(Number(appointmentEvent.id), appointment);
          }
        }else{
          //si no viene informacion de appointmentEvent, quiere decir que es una creacion
          this.createAppointment(appointment);
        }
      }
    });
  }

  buildEventActions(patientId: number): CalendarEventAction[] {
    const eventActions = [
      {
        id: patientId,
        label: '<i class="fa fa-pencil" aria-hidden="true"></i>',
        a11yLabel: 'Edit',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.handleEditEvent(event);
        },
      },
      {
        id:patientId,
        label: '<i class="fa fa-trash" aria-hidden="true"></i>',
        a11yLabel: 'Delete',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.handleDeleteEvent(event);
        },
      },
    ];
    return eventActions;
  }

  handleEditEvent(event: CalendarEvent): void {
    this.updateAppointmentStatus(event)
  }

  handleDeleteEvent(event: CalendarEvent): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Cita',
        message: '¿Seguro que quieres eliminar esta cita?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        if(event.id){
          this.deleteAppointment(Number(event.id))
        }
      }
    });
  }

  createAppointment(appointment: Appointment){
    this.spinner = true
    this.appointmentService.createAppointment(appointment).subscribe(data=>{
      this.retrieveAppointments()
      this.openSnackbar('Cita creada exitosamente', 'Ok')
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  deleteAppointment(appointment_id: number){
    this.spinner = true
    this.appointmentService.deleteAppointment(appointment_id).subscribe(data=>{
      this.retrieveAppointments()
      this.openSnackbar('Cita eliminada exitosamente', 'Ok')
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  updateAppointment(appointment_id: number, appointment: Appointment){
    this.spinner = true
    this.appointmentService.updateAppointment(appointment_id, appointment).subscribe(data=>{
      this.retrieveAppointments()
      this.openSnackbar('Cita actualizada exitosamente', 'Ok')
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  findPatientNameById(patientId: number): string {
    const patient = this.patientsList.find(patient => patient.id === patientId);
    return patient ? `${patient.name} ${patient.middle_name} ${patient.last_name}` : '';
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
  
  setView(view: CalendarView) {
    this.view = view;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    } 
  }
}