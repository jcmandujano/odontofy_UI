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
import { AgendaComponent } from './features/dentist/agenda/agenda.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: SignupComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'confirm-account', component: ConfirmAccountComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'patient-list', component: PatientListComponent },
    { path: 'patient-file', component: PatientFileComponent },
    { path: 'patient-dashboard', component: PatientDashboardComponent },
    { path: 'evolution-notes', component: EvolutionNotesComponent },
    { path: 'patient-payment', component: PatientPaymentsComponent },
    { path: 'informed-consents', component: InformedConsentsComponent },
    { path: 'odontogram', component: OdontogramComponent },
    { path: 'schedule', component: AgendaComponent },


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