import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject, filter, startWith, takeUntil } from 'rxjs';
import { Patient } from '../../../core/models/patient.model';
import { FeatureFlagsService } from '../../../core/services/feature-flags.service';
import { PacientesService } from '../../../core/services/patient.service';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

type PrimarySection = 'dashboard' | 'schedule' | 'patients' | 'settings';

interface PatientDestination {
  label: string;
  route: string;
  section: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, MatIconModule, NavBarComponent, RouterLink, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent implements OnInit, OnDestroy {
  navCollapsed = true;
  activeSection: PrimarySection = 'dashboard';
  activePatientSection = '';
  pageTitle = '';
  patientId: number | null = null;
  patient: Patient | null = null;
  patientLoading = false;

  readonly patientDestinations: PatientDestination[];

  private loadedPatientId: number | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly patientsService: PacientesService,
    featureFlags: FeatureFlagsService
  ) {
    this.patientDestinations = [
      { label: 'Resumen', route: '/patient-dashboard', section: 'patient-overview' },
      { label: 'Ficha', route: '/patient-file', section: 'patient-file' },
      ...(featureFlags.patientOdontogram
        ? [{ label: 'Odontograma', route: '/odontogram', section: 'odontogram' }]
        : []),
      { label: 'Notas de evolución', route: '/evolution-notes', section: 'evolution-notes' },
      { label: 'Tratamientos', route: '/patient-treatment-plans', section: 'treatment-plans' },
      { label: 'Consentimientos', route: '/informed-consents', section: 'consents' },
      { label: 'Pagos', route: '/patient-payment', section: 'payments' }
    ];
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      takeUntil(this.destroy$)
    ).subscribe(() => this.updateRouteContext());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setNavCollapsed(collapsed: boolean): void {
    this.navCollapsed = collapsed;
  }

  patientLink(route: string): unknown[] {
    return [route, { id: this.patientId }];
  }

  patientOverviewLink(): unknown[] {
    return ['/patient-dashboard', { id: this.patientId }];
  }

  patientName(): string {
    if (!this.patient) return this.patientLoading ? 'Cargando paciente…' : 'Paciente';
    return [this.patient.name, this.patient.middle_name, this.patient.last_name]
      .filter(Boolean)
      .join(' ');
  }

  patientAge(): number | null {
    if (!this.patient?.date_of_birth) return null;
    const birthDate = new Date(this.patient.date_of_birth);
    if (Number.isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  patientAlert(): string | null {
    const history = this.patient?.personal_medical_history;
    if (!history) return null;

    const positiveConditions = Object.entries(history)
      .filter(([, data]) => (data as { respuesta?: string }).respuesta?.toLowerCase() === 'si')
      .map(([condition]) => condition);

    return positiveConditions.length ? `Antecedentes: ${positiveConditions.join(', ')}` : null;
  }

  private updateRouteContext(): void {
    let route = this.activatedRoute;
    while (route.firstChild) route = route.firstChild;

    const snapshot = route.snapshot;
    this.pageTitle = snapshot.data['title'] ?? '';
    this.activeSection = snapshot.data['primarySection'] ?? 'dashboard';
    this.activePatientSection = snapshot.data['patientSection'] ?? '';

    const patientContext = Boolean(snapshot.data['patientContext']);
    const rawPatientId = snapshot.paramMap.get('patientId') ?? snapshot.paramMap.get('id');
    const nextPatientId = patientContext && rawPatientId ? Number(rawPatientId) : null;
    this.patientId = nextPatientId && Number.isFinite(nextPatientId) ? nextPatientId : null;

    if (!this.patientId) {
      this.patient = null;
      this.loadedPatientId = null;
      this.patientLoading = false;
      return;
    }

    if (this.patientId === this.loadedPatientId) return;

    this.loadedPatientId = this.patientId;
    const requestedPatientId = this.patientId;
    this.patient = null;
    this.patientLoading = true;
    this.patientsService.findPatient(this.patientId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: response => {
        if (this.patientId === requestedPatientId) {
          this.patient = response.data ?? null;
          this.patientLoading = false;
        }
      },
      error: () => {
        if (this.patientId === requestedPatientId) this.patientLoading = false;
      }
    });
  }
}
