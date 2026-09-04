import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

const LOCAL_SVG_ICONS = {
  add: '/icons/add.svg',
  agenda: '/icons/dashboard_agenda.svg',
  agendaDot: '/icons/agenda_dot.svg',
  concentimientos: '/icons/vepet_concentimientos.svg',
  editaCita: '/icons/dashboard_edit_cita.svg',
  eliminaCita: '/icons/dashboard_delete_cita.svg',
  ficha_id: '/icons/vepet_ficha_identificacion.svg',
  finanzas: '/icons/dashboard_finanzas.svg',
  iniciaCita: '/icons/dashboard_init_cita.svg',
  logout: '/icons/logout_dashboard.svg',
  odontograma: '/icons/vepet_odontograma.svg',
  pacientes: '/icons/dashboard_user.svg',
  patientDashboardConsents: '/icons/patient-dashboard-consents.svg',
  patientDashboardFile: '/icons/patient-dashboard-file.svg',
  patientDashboardNotes: '/icons/patient-dashboard-notes.svg',
  patientDashboardOdontogram: '/icons/patient-dashboard-odontogram.svg',
  patientDashboardPayments: '/icons/patient-dashboard-payments.svg',
  patientDashboardProfile: '/icons/patient-dashboard-profile.svg',
  patientDashboardTreatmentPlan: '/icons/patient-dashboard-treatment-plan.svg',
  recetas: '/icons/dashboard_recetas.svg',
  remove: '/icons/remove.svg',
  settings: '/icons/settings_dashboard.svg',
} as const;

@Injectable({ providedIn: 'root' })
export class LocalIconRegistryService {
  constructor(
    private readonly iconRegistry: MatIconRegistry,
    private readonly sanitizer: DomSanitizer
  ) {}

  registerIcons(): void {
    Object.entries(LOCAL_SVG_ICONS).forEach(([name, path]) => {
      this.iconRegistry.addSvgIcon(
        name,
        this.sanitizer.bypassSecurityTrustResourceUrl(path)
      );
    });
  }
}
