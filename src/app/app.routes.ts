import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/components/landing-page/landing-page.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { SignupComponent } from './features/auth/components/signup/signup.component';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password/forgot-password.component';
import { ConfirmAccountComponent } from './features/auth/components/confirm-account/confirm-account.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PatientListComponent } from './features/patients/patient-list/patient-list.component';
import { PatientFileComponent } from './features/patients/patient-file/patient-file.component';
import { PatientDashboardComponent } from './features/patients/patient-dashboard/patient-dashboard.component';
import { EvolutionNotesComponent } from './features/patients/evolution-notes/evolution-notes.component';
import { PatientPaymentsComponent } from './features/patients/patient-payments/patient-payments.component';
import { InformedConsentsComponent } from './features/patients/informed-consents/informed-consents.component';
import { OdontogramComponent } from './features/patients/odontogram/odontogram.component';
import { PatientTreatmentPlansComponent } from './features/patients/patient-treatment-plans/patient-treatment-plans.component';
import { TreatmentPlanDetailComponent } from './features/patients/treatment-plan-detail/treatment-plan-detail.component';
import { AgendaComponent } from './features/dentist/agenda/agenda.component';
import { SettingsComponent } from './features/settings/components/settings/settings.component';
import { ResetPasswordComponent } from './features/auth/components/reset-password/reset-password.component';
import { AuthGuard } from './core/guards/auth-guard.guard';
import { AppShellComponent } from './shared/components/app-shell/app-shell.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'confirm-account', component: ConfirmAccountComponent },
  { path: 'verify-account', redirectTo: 'confirm-account', pathMatch: 'full' },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Inicio', primarySection: 'dashboard' }
      },
      {
        path: 'schedule',
        component: AgendaComponent,
        data: { title: 'Agenda', primarySection: 'schedule' }
      },
      {
        path: 'patient-list',
        component: PatientListComponent,
        data: { title: 'Pacientes', primarySection: 'patients' }
      },
      {
        path: 'patient-file',
        component: PatientFileComponent,
        data: {
          title: 'Ficha de identificación',
          primarySection: 'patients',
          patientContext: true,
          patientSection: 'patient-file'
        }
      },
      {
        path: 'patient-dashboard',
        component: PatientDashboardComponent,
        data: {
          title: 'Resumen del expediente',
          primarySection: 'patients',
          patientContext: true,
          patientSection: 'patient-overview'
        }
      },
      {
        path: 'evolution-notes',
        component: EvolutionNotesComponent,
        data: {
          title: 'Notas de evolución',
          primarySection: 'patients',
          patientContext: true,
          patientSection: 'evolution-notes'
        }
      },
      {
        path: 'patient-payment',
        component: PatientPaymentsComponent,
        data: {
          title: 'Historial de pagos',
          primarySection: 'patients',
          patientContext: true,
          patientSection: 'payments'
        }
      },
      {
        path: 'informed-consents',
        component: InformedConsentsComponent,
        data: {
          title: 'Consentimientos informados',
          primarySection: 'patients',
          patientContext: true,
          patientSection: 'consents'
        }
      },
      {
        path: 'patient-treatment-plans',
        component: PatientTreatmentPlansComponent,
        data: {
          title: 'Planes de tratamiento',
          primarySection: 'patients',
          patientContext: true,
          patientSection: 'treatment-plans'
        }
      },
      {
        path: 'treatment-plan-detail',
        component: TreatmentPlanDetailComponent,
        data: {
          title: 'Detalle del plan',
          primarySection: 'patients',
          patientContext: true,
          patientSection: 'treatment-plans'
        }
      },
      {
        path: 'odontogram',
        component: OdontogramComponent,
        data: {
          title: 'Odontograma',
          primarySection: 'patients',
          patientContext: true,
          patientSection: 'odontogram'
        }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { title: 'Configuración', primarySection: 'settings' }
      }
    ]
  }

];


//esto esta encimando los componentes, posiblemente lo usamos mas adelante
/* import { Routes } from '@angular/router';

import { authRoutes } from './features/auth/auth.routes';  // Importa las rutas de auth
import { LandingPageComponent } from './features/landing/components/landing-page/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,  // Componente padre donde se cargarán los hijos
    children: [
      ...authRoutes  // Rutas hijas de login, register, etc.
    ]
  }
]; */
