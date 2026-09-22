import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { endOfWeek, startOfWeek } from 'date-fns';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Observable, catchError, finalize, forkJoin, map, of, tap } from 'rxjs';
import { Appointment } from '../../core/models/appointment.model';
import { Patient } from '../../core/models/patient.model';
import { PaymentBalance } from '../../core/models/payment-balance.model';
import { User } from '../../core/models/user.model';
import { UserInformedConsent } from '../../core/models/user-consent.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { PacientesService } from '../../core/services/patient.service';
import { PaymentService } from '../../core/services/payment.service';
import { SessionStorageService } from '../../core/services/session-storage.service';
import { UserConsentService } from '../../core/services/user-consents.service';
import { UserService } from '../../core/services/user.service';
import { ConfirmWithPasswordDialogComponent } from '../../shared/dialogs/confirm-with-password-dialog/confirm-with-password-dialog.component';
import { PrintConsentDialogComponent } from '../../shared/dialogs/print-consent-dialog/print-consent-dialog.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatIconModule, NgxSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  readonly today = new Date();

  currentUser: User = new User();
  informedConsentList: UserInformedConsent[] = [];
  patientsList: Patient[] = [];
  appointmentList: Appointment[] = [];
  paymentBalance: PaymentBalance = new PaymentBalance();
  totalPatients = 0;
  showFinanceData = true;
  fromDate: string | null = null;
  toDate: string | null = null;

  constructor(
    private readonly sessionService: SessionStorageService,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly userConsentService: UserConsentService,
    private readonly appointmentService: AppointmentService,
    private readonly patientService: PacientesService,
    private readonly paymentService: PaymentService,
    private readonly spinner: NgxSpinnerService,
    public readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.sessionService.getUser();
    this.showFinanceData = this.currentUser.show_finance_stats ?? false;
    this.spinner.show();
    this.fromDate = startOfWeek(this.today, { weekStartsOn: 1 }).toISOString();
    this.toDate = endOfWeek(this.today, { weekStartsOn: 1 }).toISOString();

    forkJoin([
      this.loadInformedConsents(),
      this.retrievePatients(),
      this.retrieveAppointments(this.fromDate, this.toDate),
      this.retrievePaymentBalance()
    ]).pipe(
      finalize(() => this.spinner.hide())
    ).subscribe();
  }

  get firstName(): string {
    return this.currentUser.name?.trim() || 'Doctor';
  }

  get todayLabel(): string {
    const label = new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(this.today);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  get todayAppointments(): Appointment[] {
    return this.appointmentList.filter(appointment =>
      this.isSameLocalDay(new Date(appointment.appointment_datetime), this.today)
    );
  }

  get remainingTodayAppointments(): number {
    const now = Date.now();
    return this.todayAppointments.filter(appointment =>
      new Date(appointment.appointment_datetime).getTime() >= now
    ).length;
  }

  get upcomingAppointments(): Appointment[] {
    const now = Date.now();
    return this.appointmentList
      .filter(appointment => new Date(appointment.appointment_datetime).getTime() >= now)
      .sort((a, b) =>
        new Date(a.appointment_datetime).getTime() - new Date(b.appointment_datetime).getTime()
      )
      .slice(0, 5);
  }

  get upcomingWeekCount(): number {
    const now = Date.now();
    return this.appointmentList.filter(appointment =>
      new Date(appointment.appointment_datetime).getTime() >= now
    ).length;
  }

  get hasAttentionItems(): boolean {
    return !this.currentUser.is_google_synced || this.totalPatients === 0 || this.informedConsentList.length === 0;
  }

  createAppointment(): void {
    this.router.navigate(['/schedule'], { queryParams: { action: 'new' } });
  }

  createPatient(): void {
    this.router.navigate(['/patient-file']);
  }

  listPatients(): void {
    this.router.navigate(['/patient-list']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  goToAgenda(appointment?: Appointment): void {
    if (!appointment) {
      this.router.navigate(['/schedule']);
      return;
    }

    const appointmentRef = appointment.id > 0
      ? `local:${appointment.id}`
      : `external:${appointment.google_event_id}`;

    this.router.navigate(['/schedule'], {
      queryParams: {
        date: appointment.appointment_datetime,
        appointmentRef
      }
    });
  }

  goToAgendaView(view: 'day' | 'week'): void {
    this.router.navigate(['/schedule'], { queryParams: { view } });
  }

  retrieveAppointments(fromDate?: string, toDate?: string): Observable<Appointment[]> {
    return this.appointmentService.listAppointments(fromDate, toDate).pipe(
      map(response => response.data ?? []),
      tap(appointments => {
        this.appointmentList = [...appointments].sort((a, b) =>
          new Date(a.appointment_datetime).getTime() - new Date(b.appointment_datetime).getTime()
        );
      }),
      catchError(error => {
        this.handleError(error);
        return of([]);
      })
    );
  }

  retrievePatients(): Observable<Patient[]> {
    return this.patientService.listPatients().pipe(
      tap(response => this.totalPatients = response.data?.total ?? response.data?.results?.length ?? 0),
      map(response => response.data?.results ?? []),
      tap(patients => this.patientsList = patients),
      catchError(error => {
        this.handleError(error);
        return of([]);
      })
    );
  }

  retrievePaymentBalance(): Observable<PaymentBalance> {
    return this.paymentService.getPaymentBalance().pipe(
      map(response => response.data ?? new PaymentBalance()),
      tap(paymentBalance => this.paymentBalance = paymentBalance),
      catchError(error => {
        this.handleError(error);
        return of(new PaymentBalance());
      })
    );
  }

  visibilityFinanceHandler(visibility: boolean): void {
    if (!visibility) {
      this.saveFinanceOptions(false);
      this.showFinanceData = false;
      return;
    }

    const dialogRef = this.dialog.open(ConfirmWithPasswordDialogComponent, {
      width: 'min(440px, 92vw)'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.spinner.show();
      this.authService.verifyPassword(result).subscribe({
        next: () => {
          this.saveFinanceOptions(true);
          this.showFinanceData = true;
          this.spinner.hide();
        },
        error: error => {
          this.spinner.hide();
          const message = error?.error?.message ?? 'No fue posible verificar la contraseña.';
          this.openSnackbar(`Ocurrió un error: ${message}`, 'Aceptar');
        }
      });
    });
  }

  launchPrintConsentDialog(): void {
    if (this.informedConsentList.length === 0) {
      this.openSnackbar(
        'No hay consentimientos disponibles. Crea uno en Configuración antes de imprimir.',
        'Aceptar'
      );
      return;
    }

    const dialogRef = this.dialog.open(PrintConsentDialogComponent, {
      width: 'min(680px, 92vw)',
      data: this.informedConsentList,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.downloadPdf(result.filename);
    });
  }

  private saveFinanceOptions(showFinanceData: boolean): void {
    const financeOptions = { show_finance_stats: showFinanceData } as User;
    this.spinner.show();
    this.userService.updateUser(this.currentUser.id, financeOptions).pipe(
      finalize(() => this.spinner.hide())
    ).subscribe({
      next: response => {
        if (!response.data) return;
        this.currentUser = response.data;
        this.sessionService.saveUser(response.data);
      },
      error: error => {
        const message = error?.error?.error?.message ?? 'No fue posible guardar la preferencia.';
        this.openSnackbar(`Ocurrió un error: ${message}`, 'Aceptar');
      }
    });
  }

  private loadInformedConsents(): Observable<UserInformedConsent[]> {
    return this.userConsentService.listUserConsent().pipe(
      map(response => response.data?.results ?? []),
      tap(consents => this.informedConsentList = consents),
      catchError(error => {
        this.handleError(error);
        return of([]);
      })
    );
  }

  private downloadPdf(filename: string): void {
    const link = document.createElement('a');
    link.href = '/static/informed-consents-demo/dummy_doc.pdf';
    link.download = filename;
    link.click();
  }

  private isSameLocalDay(firstDate: Date, secondDate: Date): boolean {
    return firstDate.getFullYear() === secondDate.getFullYear()
      && firstDate.getMonth() === secondDate.getMonth()
      && firstDate.getDate() === secondDate.getDate();
  }

  private handleError(error: unknown): void {
    console.error('No fue posible cargar una sección del resumen.', error);
  }

  private openSnackbar(message: string, action: string): void {
    this.snackBar.open(message, action, { duration: 4000 });
  }
}
