import { Component, ElementRef, OnInit } from '@angular/core';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
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
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { NavBarComponent } from '../../shared/components/nav-bar/nav-bar.component';
import { UserService } from '../../core/services/user.service';
import { ConfirmWithPasswordDialogComponent } from '../../shared/dialogs/confirm-with-password-dialog/confirm-with-password-dialog.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    CommonModule,
    NoDataFoundComponent,
    NgxSpinnerModule,
    NavBarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: User = new User;
  informedConsentList: UserInformedConsent[] = [];
  events: CalendarEvent[] = []
  patientsList: Patient[] = []
  appointmentList: Appointment[] = []
  paymentBalance: PaymentBalance = new PaymentBalance();
  showFinanceData: boolean = true;
  constructor(private sessionService: SessionStorageService,
    private router: Router,
    private elementRef: ElementRef,
    private matIconRegistry: MatIconRegistry,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userConsentService: UserConsentService,
    private appointmentService: AppointmentService,
    private patientService: PacientesService,
    private paymentService: PaymentService,
    private spinner: NgxSpinnerService,
    private domSanitizer: DomSanitizer,
    public authService: AuthService,
    private userService: UserService) {
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
    this.showFinanceData = this.currentUser.show_finance_stats ?? false;
    this.spinner.show();

    const metodos$ = [
      this.loadInformedConsents(),
      this.retrievePatients(),
      this.retrieveAppointments(),
      this.retrievePaymentBalance()
    ].filter(m => m);

    forkJoin(metodos$).subscribe({
      next: () => {
        console.log('Todos los métodos ejecutados');
        this.spinner.hide();
      },
      error: (err: any) => {
        console.error('Error ejecutando métodos:', err);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#fff';
  }

  doLogout() {
    this.sessionService.signOut();
    this.router.navigate([''])
  }

  crearPaciente() {
    this.router.navigate(['patient-file'])
  }

  listadePacientes() {
    this.router.navigate(['patient-list'])
  }

  goToAgenda() {
    this.router.navigate(['schedule'])
  }

  retrieveAppointments() {
    this.appointmentService.listAppointments().subscribe(response => {

      // Asignar el nombre completo del paciente a cada cita
      this.appointmentList = response.data?.results.map((appointment: Appointment) => ({
        ...appointment,
        patientFullName: this.findPatientNameById(appointment.patient_id)
      })) ?? [];

    }, (error) => {
      console.log('ERROR', error)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  retrievePatients() {
    this.patientService.listPatients().subscribe(response => {
      this.patientsList = response.data?.results ?? [];
    }, (error) => {
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  saveFinanceOptions(showFinanceData: boolean) {
    const financeOptions = {
      show_finance_stats: showFinanceData
    } as unknown as User
    this.spinner.show()
    this.userService.updateUser(this.currentUser.id, financeOptions).subscribe(data => {
      this.spinner.hide()
      this.sessionService.saveUser(data)
      console.log('Se guardaron las opciones de finanzas', data)
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }


  retrievePaymentBalance() {
    this.paymentService.getPaymentBalance().subscribe(response => {
      this.paymentBalance = response.data as PaymentBalance;
    }, (error) => {
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

  visibilityFinanceHandler(visibility: boolean) {
    if (visibility) {
      const dialogRef = this.dialog.open(ConfirmWithPasswordDialogComponent, {
        width: '40vw',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const confirmPassword = result
          this.spinner.show()
          this.authService.verifyPassword(confirmPassword).subscribe(data => {
            this.saveFinanceOptions(visibility)
            this.showFinanceData = visibility;
            this.spinner.hide()
            console.log('Se confirma operacion')
          }, (error) => {
            this.spinner.hide()
            console.log('ERROR', error.error.msg)
            this.openSnackbar(`Ocurrio un error: ${error.error.msg}`, 'Ok')
          })
        }
      });
    } else {
      this.saveFinanceOptions(visibility)
      this.showFinanceData = visibility;
    }
  }

  /**
   * Carga la lista de consentimientos informados desde el servicio y la asigna al componente.
   */
  private loadInformedConsents(): Observable<UserInformedConsent[]> {
    return this.userConsentService.listUserConsent().pipe(
      tap(response => this.informedConsentList = response.data?.results ?? []), // Asignar datos al recibir respuesta
      // Map the API response to just the results array
      // Import 'map' from 'rxjs/operators' if not already imported
      map(response => response.data?.results ?? [])
    );
  }


  /**
   * Abre un diálogo para crear un nuevo consentimiento informado.
   * Si el diálogo se cierra con un resultado, se inicia la descarga del PDF.
   */
  launchPrintConsentDialog(): void {
    const dialogRef = this.dialog.open(PrintConsentDialogComponent, {
      width: '40vw',
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
    console.error('ERROR', error.error.error.message);
    // Descomentar la siguiente línea para mostrar una notificación de error
    // this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok');
  }

}
