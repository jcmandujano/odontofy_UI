import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { Appointment } from '../../../core/models/appointment.model';
import { EvolutionNote } from '../../../core/models/evolution-note.model';
import { Patient } from '../../../core/models/patient.model';
import { Payment } from '../../../core/models/payment.model';
import {
  TREATMENT_PLAN_STATUS_LABELS,
  TreatmentPlan,
  TreatmentPlanItem,
  TreatmentPlanItemStatus,
  TreatmentPlanStatus
} from '../../../core/models/treatment-plan.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { EvolutionNoteService } from '../../../core/services/evolution-note.service';
import { PacientesService } from '../../../core/services/patient.service';
import { PaymentService } from '../../../core/services/payment.service';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';

interface ClinicalAlert {
  label: string;
  detail: string;
  priority: 'high' | 'standard';
}

interface MedicalHistoryAnswer {
  respuesta?: string;
  comentarios?: string;
}

const MEDICAL_HISTORY_LABELS: Array<{ key: string; label: string; priority?: 'high' }> = [
  { key: 'alergias', label: 'Alergias', priority: 'high' },
  { key: 'problemasPresion', label: 'Problemas de presión', priority: 'high' },
  { key: 'problemaCorazon', label: 'Problemas del corazón', priority: 'high' },
  { key: 'diabetes', label: 'Diabetes', priority: 'high' },
  { key: 'bajoTratamientoMedico', label: 'Actualmente bajo tratamiento médico' },
  { key: 'consumeDrogas', label: 'Consumo de sustancias' },
  { key: 'hepatitis', label: 'Hepatitis' },
  { key: 'vih', label: 'VIH' },
  { key: 'ets', label: 'Enfermedad de transmisión sexual' },
  { key: 'fiebreReumatica', label: 'Fiebre reumática' },
  { key: 'asma', label: 'Asma' },
  { key: 'epilepsia', label: 'Epilepsia' },
  { key: 'tiroides', label: 'Problemas de tiroides' },
  { key: 'ulceraGastrica', label: 'Úlcera gástrica' },
  { key: 'gastritis', label: 'Gastritis' },
  { key: 'embarazo', label: 'Embarazo' },
  { key: 'intervencionQuirurgica', label: 'Intervención quirúrgica previa' }
];

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss'
})
export class PatientDashboardComponent implements OnInit {
  patientId = 0;
  patient: Patient | null = null;
  clinicalAlerts: ClinicalAlert[] = [];
  familyHistory = '';
  nextAppointment: Appointment | null = null;
  activeTreatmentPlan: TreatmentPlan | null = null;
  latestNote: EvolutionNote | null = null;
  latestPayment: Payment | null = null;
  loading = true;

  readonly treatmentPlanStatusLabels = TREATMENT_PLAN_STATUS_LABELS;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly patientsService: PacientesService,
    private readonly appointmentsService: AppointmentService,
    private readonly treatmentPlansService: TreatmentPlanService,
    private readonly evolutionNotesService: EvolutionNoteService,
    private readonly paymentsService: PaymentService
  ) {}

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.patientId) {
      this.loading = false;
      return;
    }

    this.loadSummary();
  }

  get balance(): number {
    return (this.patient?.debt ?? 0) * -1;
  }

  get hasDebt(): boolean {
    return (this.patient?.debt ?? 0) > 0;
  }

  get treatmentItems(): TreatmentPlanItem[] {
    return this.activeTreatmentPlan?.TreatmentPlanItems ?? [];
  }

  get completedTreatmentItems(): number {
    return this.treatmentItems.filter(item => item.status === TreatmentPlanItemStatus.COMPLETED).length;
  }

  get treatmentProgress(): number | null {
    if (!this.treatmentItems.length) return null;
    return Math.round((this.completedTreatmentItems / this.treatmentItems.length) * 100);
  }

  get nextTreatmentItem(): TreatmentPlanItem | null {
    return this.treatmentItems.find(item =>
      item.status !== TreatmentPlanItemStatus.COMPLETED &&
      item.status !== TreatmentPlanItemStatus.CANCELLED
    ) ?? null;
  }

  get treatmentStatusLabel(): string {
    if (!this.activeTreatmentPlan) return '';
    return this.treatmentPlanStatusLabels[this.activeTreatmentPlan.status] ?? this.activeTreatmentPlan.status;
  }

  get latestNotePreview(): string {
    return this.latestNote ? this.plainText(this.latestNote.note) : '';
  }

  get latestPaymentDescription(): string {
    return this.latestPayment?.displayConcepts || 'Pago registrado';
  }

  goToPatientFile(): void {
    this.router.navigate(['/patient-file', { id: this.patientId }]);
  }

  goToSchedule(): void {
    this.router.navigate(['/schedule'], { queryParams: { action: 'new' } });
  }

  goToEvolutionNotes(): void {
    this.router.navigate(['/evolution-notes', { id: this.patientId }]);
  }

  goToPayments(): void {
    this.router.navigate(['/patient-payment', { id: this.patientId }]);
  }

  goToTreatmentPlans(): void {
    this.router.navigate(['/patient-treatment-plans', { id: this.patientId }]);
  }

  goToTreatmentPlanDetail(): void {
    if (!this.activeTreatmentPlan) {
      this.goToTreatmentPlans();
      return;
    }

    this.router.navigate(['/treatment-plan-detail', {
      id: this.activeTreatmentPlan.id,
      patientId: this.patientId
    }]);
  }

  private loadSummary(): void {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 365);
    to.setHours(23, 59, 59, 999);

    forkJoin({
      patient: this.patientsService.findPatient(this.patientId).pipe(
        map(response => response.data),
        catchError(() => of(null))
      ),
      appointments: this.appointmentsService
        .listPatientAppointments(this.patientId, from.toISOString(), to.toISOString())
        .pipe(
          map(response => response.data ?? []),
          catchError(() => of([] as Appointment[]))
        ),
      treatmentPlan: this.loadActiveTreatmentPlan(),
      latestNote: this.evolutionNotesService.listNotes(this.patientId, 1, 1).pipe(
        map(response => response.data?.results[0] ?? null),
        catchError(() => of(null))
      ),
      latestPayment: this.paymentsService.listPayments(this.patientId, 1, 1).pipe(
        map(response => response.data?.results[0] ?? null),
        catchError(() => of(null))
      )
    }).subscribe(result => {
      this.patient = result.patient;
      this.clinicalAlerts = this.buildClinicalAlerts(result.patient);
      this.familyHistory = this.readFamilyHistory(result.patient);
      this.nextAppointment = result.appointments
        .filter(appointment => new Date(appointment.appointment_datetime).getTime() >= from.getTime())
        .sort((left, right) =>
          new Date(left.appointment_datetime).getTime() - new Date(right.appointment_datetime).getTime()
        )[0] ?? null;
      this.activeTreatmentPlan = result.treatmentPlan;
      this.latestNote = result.latestNote;
      this.latestPayment = result.latestPayment;
      this.loading = false;
    });
  }

  private loadActiveTreatmentPlan() {
    return this.treatmentPlansService.listTreatmentPlansByPatient(this.patientId, 1, 100).pipe(
      map(response => this.selectActiveTreatmentPlan(response.data?.results ?? [])),
      switchMap(plan => {
        if (!plan) return of(null);
        return this.treatmentPlansService.getTreatmentPlanDetail(plan.id).pipe(
          map(response => response.data ?? plan),
          catchError(() => of(plan))
        );
      }),
      catchError(() => of(null))
    );
  }

  private selectActiveTreatmentPlan(plans: TreatmentPlan[]): TreatmentPlan | null {
    const priority = new Map<TreatmentPlanStatus, number>([
      [TreatmentPlanStatus.IN_PROGRESS, 0],
      [TreatmentPlanStatus.ACCEPTED, 1],
      [TreatmentPlanStatus.PROPOSED, 2],
      [TreatmentPlanStatus.DRAFT, 3]
    ]);

    return plans
      .filter(plan => priority.has(plan.status))
      .sort((left, right) => (priority.get(left.status) ?? 99) - (priority.get(right.status) ?? 99))[0] ?? null;
  }

  private buildClinicalAlerts(patient: Patient | null): ClinicalAlert[] {
    if (!patient) return [];
    const history = patient.personal_medical_history as Record<string, MedicalHistoryAnswer>;

    const alerts = MEDICAL_HISTORY_LABELS.flatMap(({ key, label, priority }) => {
      const answer = history?.[key];
      const isPositive = String(answer?.respuesta ?? '').trim().toLocaleLowerCase('es-MX') === 'si';
      if (!isPositive) return [];
      return [{
        label,
        detail: String(answer?.comentarios ?? '').trim(),
        priority: priority ?? 'standard'
      } satisfies ClinicalAlert];
    });

    const otherNotes = String(history?.['otros']?.comentarios ?? '').trim();
    if (otherNotes) alerts.push({ label: 'Otros antecedentes', detail: otherNotes, priority: 'standard' });
    return alerts;
  }

  private readFamilyHistory(patient: Patient | null): string {
    const history = patient?.family_medical_history;
    return typeof history === 'string' ? history.trim() : '';
  }

  private plainText(html: string): string {
    const container = document.createElement('div');
    container.innerHTML = html;
    return (container.textContent ?? '').replace(/\s+/g, ' ').trim();
  }
}
