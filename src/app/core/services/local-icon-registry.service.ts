import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

const LOCAL_SVG_ICONS = {
  add: '/icons/iconsV3/plus-circle.svg',
  agenda: '/icons/iconsV3/agenda.svg',
  agendaDot: '/icons/iconsV3/appointment-dot.svg',
  concentimientos: '/icons/iconsV3/consent-document.svg',
  editaCita: '/icons/iconsV3/edit.svg',
  eliminaCita: '/icons/iconsV3/trash.svg',
  ficha_id: '/icons/iconsV3/id-card.svg',
  finanzas: '/icons/iconsV3/payments.svg',
  mainDashboardAgenda: '/icons/iconsV3/agenda.svg',
  mainDashboardAppointmentDot: '/icons/iconsV3/appointment-dot.svg',
  mainDashboardConsents: '/icons/iconsV3/consent-document.svg',
  mainDashboardFinance: '/icons/iconsV3/payments.svg',
  mainDashboardFinanceHidden: '/icons/iconsV3/eye-off.svg',
  mainDashboardFinanceVisible: '/icons/iconsV3/eye.svg',
  mainDashboardPatients: '/icons/iconsV3/patient-add.svg',
  iniciaCita: '/icons/iconsV3/check-square.svg',
  logout: '/icons/iconsV3/power.svg',
  odontograma: '/icons/iconsV3/tooth.svg',
  pacientes: '/icons/iconsV3/patient-add.svg',
  patientDashboardConsents: '/icons/iconsV3/consent-document.svg',
  patientDashboardFile: '/icons/iconsV3/id-card.svg',
  patientDashboardNotes: '/icons/iconsV3/clinical-notes.svg',
  patientDashboardOdontogram: '/icons/iconsV3/tooth.svg',
  patientDashboardPayments: '/icons/iconsV3/payments.svg',
  patientDashboardProfile: '/icons/iconsV3/patient-add.svg',
  patientDashboardTreatmentPlan: '/icons/iconsV3/list-details.svg',
  recetas: '/icons/iconsV3/prescription.svg',
  remove: '/icons/iconsV3/minus-circle.svg',
  settings: '/icons/iconsV3/settings.svg',
  calendar: '/icons/iconsV3/calendar.svg',
  bell: '/icons/iconsV3/bell.svg',
  checkCircle: '/icons/iconsV3/check-circle.svg',
  closeCircle: '/icons/iconsV3/close-circle.svg',
  close: '/icons/iconsV3/close-circle.svg',
  eye: '/icons/iconsV3/eye.svg',
  eyeOff: '/icons/iconsV3/eye-off.svg',
  key: '/icons/iconsV3/key.svg',
  mail: '/icons/iconsV3/mail.svg',
  phone: '/icons/iconsV3/phone.svg',
  search: '/icons/iconsV3/search.svg',
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
