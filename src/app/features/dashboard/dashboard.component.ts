import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import {MatIconModule} from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

import { User } from '../../core/models/user.model';
import { SessionStorageService } from '../../core/services/session-storage.service';
import { PrintConsentDialogComponent } from '../../shared/dialogs/print-consent-dialog/print-consent-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserInformedConsent } from '../../core/models/user-consent.model';
import { UserConsentService } from '../../core/services/user-consents.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { CalendarEvent } from 'angular-calendar';
import { Appointment } from '../../core/models/appointment.model';
import { PacientesService } from '../../core/services/patient.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Patient } from '../../core/models/patient.model';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentBalance } from '../../core/models/payment-balance.model';
import { NoDataFoundComponent } from '../../shared/components/no-data-found/no-data-found.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    CommonModule,
    NoDataFoundComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  currentUser: User = new User;
  informedConsentList: UserInformedConsent[] = [];
  // Indicador para mostrar el spinner de carga
  spinner = false;
  events: CalendarEvent[] = []
  patientsList: Patient[] = []
  appointmentList: Appointment[] = []
  paymentBalance: PaymentBalance = new PaymentBalance();
  constructor(private sessionService : SessionStorageService,
  private router: Router, 
  private elementRef: ElementRef,
  private matIconRegistry: MatIconRegistry,
  private dialog: MatDialog,
  private snackBar: MatSnackBar,
  private userConsentService: UserConsentService,
  private appointmentService: AppointmentService,
  private patientService: PacientesService,
  private paymentService: PaymentService,
  private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      "agenda",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_agenda.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "finanzas",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_finanzas.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "pacientes",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_user.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "concentimientos",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/vepet_concentimientos.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "ficha_id",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/vepet_ficha_identificacion.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "odontograma",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/vepet_odontograma.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "settings",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/settings_dashboard.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "logout",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/logout_dashboard.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "recetas",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_recetas.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "agendaDot",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_agenda.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "iniciaCita",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_init_cita.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "editaCita",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_edit_cita.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "eliminaCita",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_delete_cita.svg")
    );

   }


  ngOnInit(): void {
    this.currentUser = this.sessionService.getUser();
    this.loadInformedConsents();
    this.retrievePatients();
    this.retrieveAppointments();
    this.retrievePaymentBalance();
  }

  ngAfterViewInit(){
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#f6f9fd';
  }

  doLogout(){
    this.sessionService.signOut();
    this.router.navigate([''])
  }

  crearPaciente(){
    this.router.navigate(['patient-file'])
  }

  listadePacientes(){
    this.router.navigate(['patient-list'])
  }

  goToAgenda(){
    this.router.navigate(['schedule'])
  }

  retrieveAppointments(){
    this.spinner = true
    this.appointmentService.listAppointments().subscribe(data=>{

      // Asignar el nombre completo del paciente a cada cita
      this.appointmentList = data.appointments.map((appointment: Appointment) => ({
        ...appointment,
        patientFullName: this.findPatientNameById(appointment.patient_id)
      }));
  
      this.spinner = false
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
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

  retrievePaymentBalance(){
    this.spinner = true
    this.paymentService.getPaymentBalance().subscribe(data=>{
      this.paymentBalance = data as PaymentBalance;
      console.log('BALANCE', this.paymentBalance)
      this.spinner = false
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.message}`, 'Ok')
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

  /**
   * Carga la lista de consentimientos informados desde el servicio y la asigna al componente.
   */
  private loadInformedConsents(): void {
    this.userConsentService.listUserConsent().subscribe({
      next: data => {
        this.informedConsentList = data; // Asignar lista de consentimientos informados
        this.spinner = false;
      },
      error: err => this.handleError(err) // Manejo de errores
    });
  }

  /**
   * Abre un diálogo para crear un nuevo consentimiento informado.
   * Si el diálogo se cierra con un resultado, se inicia la descarga del PDF.
   */
  launchPrintConsentDialog(): void {
    const dialogRef = this.dialog.open(PrintConsentDialogComponent, {
      width: '40vw',
      height: '280px',
      data: this.informedConsentList,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.downloadPdf(result.filename);
      }
    });
  }

  /**
   * Simula la descarga de un consentimiento informado como PDF.
   * Este método deberá ser actualizado cuando se implemente la funcionalidad de descarga real.
   * @param filename Nombre del archivo PDF a descargar.
   */
  private downloadPdf(filename: string): void {
    const link = document.createElement('a');
    link.href = '/static/informed-consents-demo/dummy_doc.pdf';
    link.download = filename;
    link.click();
  }

  /**
   * Maneja los errores de las llamadas HTTP, detiene el spinner y muestra un mensaje en consola.
   * @param error Error capturado de la respuesta HTTP.
   */
  private handleError(error: any): void {
    this.spinner = false;
    console.error('ERROR', error.error.error.message);
    // Descomentar la siguiente línea para mostrar una notificación de error
    // this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok');
  }
    
}
