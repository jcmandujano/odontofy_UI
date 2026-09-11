import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { FeatureFlagsService } from '../../../core/services/feature-flags.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss'
})
export class PatientDashboardComponent {
  readonly showPatientOdontogram: boolean;
  pacienteId: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    featureFlags: FeatureFlagsService
  ) {
    this.showPatientOdontogram = featureFlags.patientOdontogram;
  }

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.paramMap.get('id');
  }

  goToExpediente(): void {
    this.router.navigate(['/patient-file', { id: this.pacienteId }]);
  }

  goToNotasEvolucion(): void {
    this.router.navigate(['/evolution-notes', { id: this.pacienteId }]);
  }

  goToHistorialPagos(): void {
    this.router.navigate(['/patient-payment', { id: this.pacienteId }]);
  }

  goToTreatmentPlans(): void {
    this.router.navigate(['/patient-treatment-plans', { id: this.pacienteId }]);
  }

  goToOdontograma(): void {
    this.router.navigate(['/odontogram', { id: this.pacienteId }]);
  }

  goToConsentimientos(): void {
    this.router.navigate(['/informed-consents', { id: this.pacienteId }]);
  }
}
