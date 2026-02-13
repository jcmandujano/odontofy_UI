import { Component, ElementRef } from '@angular/core';
import { CalendarEvent, CalendarModule, CalendarUtils, DateAdapter, CalendarA11y, CalendarDateFormatter, CalendarEventTitleFormatter, CalendarView, DAYS_OF_WEEK, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { formatDate, registerLocaleData } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EventColor } from 'calendar-utils';
import { from, Subject } from 'rxjs';
import localeEs from '@angular/common/locales/es';
import { AppointmentMgmtDialogComponent } from '../../../shared/dialogs/appointment-mgmt-dialog/appointment-mgmt-dialog.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { Patient } from '../../../core/models/patient.model';
import { PacientesService } from '../../../core/services/patient.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { User } from '../../../core/models/user.model';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { UserService } from '../../../core/services/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import {
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  startOfDay, endOfDay
} from 'date-fns';
import { environment } from '../../../../environments/environment';
registerLocaleData(localeEs);

const colors: Record<string, EventColor> = {
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  }
};

@Component({
  selector: 'app-agenda',
  imports: [
    CalendarModule,
    MatProgressSpinnerModule,
    NavBarComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    NgxSpinnerModule
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
  view: CalendarView = CalendarView.Month;
  locale: string = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  CalendarView = CalendarView;
  refresh = new Subject<void>();
  activeDayIsOpen: boolean = true;
  events: CalendarEvent[] = []
  patientsList: Patient[] = []
  currentUser: User = new User;
  isUserSyncGoogle: boolean = false;
  fromDate: string | null = null;
  toDate: string | null = null;

  constructor(
    private elementRef: ElementRef,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private patientService: PacientesService,
    private appointmentService: AppointmentService,
    private spinner: NgxSpinnerService,
    private sessionService: SessionStorageService,
    private userService: UserService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      "calendar",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/google-calendar.png")
    );
  }

  ngOnInit(): void {
    this.currentUser = this.sessionService.getUser();
    this.isUserSyncGoogle = this.currentUser.is_google_synced ?? false;
    this.retrievePatients()
    // Aquí calculas el rango inicial del mes actual (porque view = Month al inicio)
    const range = this.getViewRange();
    this.fromDate = formatDate(range.start, 'yyyy-MM-dd', 'en-US');
    this.toDate = formatDate(range.end, 'yyyy-MM-dd', 'en-US');

    this.retrieveAppointments(this.fromDate, this.toDate);
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = '#ffffff';
  }

  retrievePatients() {
    this.spinner.show()
    this.patientService.listPatients().subscribe(response => {
      this.patientsList = response.data?.results ?? []
      this.spinner.hide()
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  retrieveAppointments(startDate: string, endDate: string) {
    this.spinner.show();
    this.appointmentService.listAppointments(startDate, endDate)
      .subscribe(response => {
        console.log('data', response.data)
        const appointments: Appointment[] = Array.isArray(response.data) ? response.data : [];
        console.log('Transformed Appointments:', appointments);
        this.events = this.transformAppointmentsToEvents(appointments);
        console.log('Calendar Events:', this.events);
        this.spinner.hide();
      }, (error) => {
        this.spinner.hide();
        console.error('ERROR', error);
        this.openSnackbar(`Ocurrió un error: ${error.error.error.message}`, 'Ok');
      });
  }

  newAppointment() {
    this.launchAppointmentDialog(undefined)
  }

  updateAppointmentStatus(appointment: CalendarEvent): void {
    this.launchAppointmentDialog(appointment)
  }

  buildAppointmentData(appointmentData: any): Appointment {

    // Crear instancia de la clase Appointment
    return new Appointment(
      appointmentData.id,
      appointmentData.patient,
      appointmentData.appointmentTime, // Fecha y hora en formato ISO UTC
      appointmentData.appointmentEndTime,
      appointmentData.appointmentNote,
      appointmentData.reason,
      appointmentData.google_event_id,
      'pendiente' // Estado por defecto
    );
  }

  transformAppointmentsToEvents(appointments: Appointment[]): CalendarEvent[] {
    return appointments.map(appointment => {
      // Combinar fecha y hora en formato ISO (YYYY-MM-DDTHH:mm:ss)
      console.log('date time', appointment.appointment_datetime)
      const appointmentDate = new Date(appointment.appointment_datetime);
      const appointmentEndDate = new Date(appointment.appointment_end_datetime);

      return {
        id: appointment.id,
        meta: { appointment },
        start: appointmentDate,
        end: appointmentEndDate,
        title : appointment.reason, 
        //title: `Cita con paciente: ${this.findPatientNameById(appointment.patient_id)}`,
        color: { ...colors['blue'] },
        //if appointment's id is null, means comes from google so we dont asign actions
        actions: appointment.id ? this.buildEventActions(appointment.patient_id) : [],
        cssClass: 'action-icons'
      } as CalendarEvent;
    });
  }

  launchAppointmentDialog(appointmentEvent?: CalendarEvent): void {
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
        if (appointmentEvent) {
          if (appointmentEvent?.id !== undefined) {
            this.updateAppointment(Number(appointmentEvent.id), appointment);
          }
        } else {
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
        id: patientId,
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
      if (result) {
        if (event.id) {
          this.deleteAppointment(Number(event.id))
        }
      }
    });
  }

  createAppointment(appointment: Appointment) {
    this.spinner.show()
    this.appointmentService.createAppointment(appointment).subscribe(data => {
      this.retrieveAppointments(this.fromDate ?? '', this.toDate ?? '')
      this.openSnackbar('Cita creada exitosamente', 'Ok')
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  deleteAppointment(appointment_id: number) {
    this.spinner.show()
    this.appointmentService.deleteAppointment(appointment_id).subscribe(data => {
      this.retrieveAppointments(this.fromDate ?? '', this.toDate ?? '')
      this.openSnackbar('Cita eliminada exitosamente', 'Ok')
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  updateAppointment(appointment_id: number, appointment: Appointment) {
    this.spinner.show()
    this.appointmentService.updateAppointment(appointment_id, appointment).subscribe(data => {
      this.retrieveAppointments(this.fromDate ?? '', this.toDate ?? '')
      this.openSnackbar('Cita actualizada exitosamente', 'Ok')
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  syncGoogle() {
    //TODO : Cambiar la URL a la de produccion
    const apiUrl = environment.API_URL;
    const popup = window.open(
      `${apiUrl}/google/init?uid=${this.currentUser.id}`,
      'GoogleAuth',
      'width=600,height=600'
    );

    // Escuchar mensajes desde la ventana hija
    window.addEventListener('message', (event) => {
      if (event.origin !== apiUrl) return; // seguridad
      console.log('Mensaje recibido:', event.data);

      if (event.data === 'google_sync_success') {
        // Puedes hacer alguna acción en el frontend, como recargar datos
        this.retrieveCurrentUser(this.currentUser.id)
      }
    });
  }

  retrieveCurrentUser(id: number) {
    console.log('retrieve user with id', id)
    this.userService.findUser(id).subscribe(response => {
      console.log('data', response)
      if (response.data) {
        this.currentUser = response.data;
        this.sessionService.saveUser(response.data);
      }
    }
      , (error) => {
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
    this.onViewChange();
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

  getViewRange(): { start: string; end: string } {
    let start: Date;
    let end: Date;

    switch (this.view) {
      case CalendarView.Month:
        start = startOfMonth(this.viewDate);
        end = endOfMonth(this.viewDate);
        break;
      case CalendarView.Week:
        start = startOfWeek(this.viewDate, { weekStartsOn: this.weekStartsOn as import('date-fns').Day });
        end = endOfWeek(this.viewDate, { weekStartsOn: this.weekStartsOn as import('date-fns').Day });
        break;
      case CalendarView.Day:
        start = startOfDay(this.viewDate);
        end = endOfDay(this.viewDate);
        break;
    }

    // 👉 Formatear a 'yyyy-MM-dd'
    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    };
  }

  onViewDateChange(date: Date) {
    this.viewDate = date;
    this.onViewChange();
  }

  onViewChange() {
    const range = this.getViewRange();
    console.log('Consultando citas del', range.start, 'al', range.end);
    this.fromDate = new Date(range.start).toISOString();
    this.toDate = new Date(range.end).toISOString();
    this.retrieveAppointments(this.fromDate, this.toDate);
  }
}