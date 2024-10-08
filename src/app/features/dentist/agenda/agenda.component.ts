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
  actions: CalendarEventAction[]
  events: CalendarEvent[] = []
  patientsList: Patient[] = []
  constructor(
    private elementRef: ElementRef,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private patientService: PacientesService,
    private appointmentService: AppointmentService
  ){
    this.actions = [
      {
        label: '<i class="fa fa-pencil" aria-hidden="true"></i>',
        a11yLabel: 'Edit',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.handleEvent('Edited', event);
        },
      },
      {
        label: '<i class="fa fa-trash" aria-hidden="true"></i>',
        a11yLabel: 'Delete',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.events = this.events.filter((iEvent: CalendarEvent<any>) => iEvent !== event);
          this.handleEvent('Deleted', event);
        },
      },
    ];
  
   /*  this.events = [
      {
        start: startOfDay(new Date()),
        title: 'Cita con paciente',
        color: { ...colors['blue'] },
        actions: this.actions,
        cssClass: 'action-icons'
      },
      {
        start: setHours(setMinutes(new Date(2024, 9, 15), 0), 13),  // 15 de octubre, 1:00 PM
        end: setHours(setMinutes(new Date(2024, 9, 15), 0), 14),    // 15 de octubre, 2:00 PM
        title: 'Event at 1 PM',
        color: { ...colors['blue'] },
        actions: this.actions
      },
      {
        start: setHours(setMinutes(new Date(2024, 9, 15), 0), 15),  // 15 de octubre, 3:00 PM
        end: setHours(setMinutes(new Date(2024, 9, 15), 0), 16),    // 15 de octubre, 4:00 PM
        title: 'Event at 3 PM',
        color: { ...colors['blue'] },
        actions: this.actions
      },
    ]; */
  }

  ngOnInit(): void {
    this.retrievePatients()
    this.retrieveAppointments()
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
      console.log('DATA', data.appointments)
      this.events = this.transformAppointmentsToEvents(data.appointments);
      this.spinner = false
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument
        .body.style.backgroundColor = '#ffffff';
  }

  createAppointmentDialog() { 
    const dialogRef = this.dialog.open(AppointmentMgmtDialogComponent, {
      width: '40vw',
      height: '80vh',
      data: {
        patients: this.patientsList
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Convertir appointmentDate a 'YYYY-MM-DD'
        const appointmentDate = new Date(result.appointmentDate).toISOString().split('T')[0];
  
        // Asegurarse de que appointmentTime esté en formato 'HH:MM:SS'
        const appointmentTime = result.appointmentTime.length === 5 
          ? `${result.appointmentTime}:00`  // Agregar segundos si solo tiene horas y minutos
          : result.appointmentTime;
  
        // Crear instancia de la clase Appointment
        const appointment = new Appointment(
          result.patient,
          appointmentDate, // Fecha en formato 'YYYY-MM-DD'
          appointmentTime, // Tiempo en formato 'HH:MM:SS'
          result.appointmentNote,
          'pendiente' // Estado por defecto
        );
  
        console.log('The dialog was closed', appointment);
      }
    });
  }

  transformAppointmentsToEvents(appointments: Appointment[]): CalendarEvent[] {
    return appointments.map(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      const [hours, minutes] = appointment.appointment_time.split(':').map(Number);
  
      return {
        start: setHours(setMinutes(appointmentDate, minutes), hours),  // Fecha y hora de inicio
        end: setHours(setMinutes(appointmentDate, minutes + 30), hours),  // Fecha y hora de fin (asumiendo 30 minutos)
        title: `Cita con paciente ${appointment.patient_id}`,  // Título del evento
        color: { ...colors['blue'] },  // Color del evento (ajusta según tu preferencia)
        actions: this.actions,  // Acciones disponibles en el evento
        cssClass: 'action-icons'
      } as CalendarEvent;  // Cast como CalendarEvent para asegurarse del tipo
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

  handleEvent(action: string, event: CalendarEvent): void {
    /* this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' }); */
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}