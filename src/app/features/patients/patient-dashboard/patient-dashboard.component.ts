import { Component, ElementRef } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { PacientesService } from '../../../core/services/patient.service';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { Patient } from '../../../core/models/patient.model';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-patient-dashboard',
    imports: [
        NavBarComponent,
        MatProgressSpinnerModule,
        MatIconModule
    ],
    templateUrl: './patient-dashboard.component.html',
    styleUrl: './patient-dashboard.component.scss'
})
export class PatientDashboardComponent {
  pacienteId: any
  paciente: Patient | undefined
  spinner= false
  constructor(private sessionService : SessionStorageService,
     private elementRef: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private matIconRegistry: MatIconRegistry,
    private pacientesService: PacientesService,
    private snackBar: MatSnackBar,
    private domSanitizer: DomSanitizer) {
      this.matIconRegistry.addSvgIcon(
        "settings",
        this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/settings_dashboard.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "logout",
        this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/logout_dashboard.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "agenda",
        this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_agenda.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "agendaDot",
        this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/agenda_dot.svg")
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
      this.matIconRegistry.addSvgIcon(
        "finanzas",
        this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_finanzas.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "recetas",
        this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_recetas.svg")
      );
      this.matIconRegistry.addSvgIcon(
        "pacientes",
        this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_user.svg")
      );
    }

    ngOnInit(): void {
      this.pacienteId = this.route.snapshot.paramMap.get('id');
      if(this.pacienteId){
        this.spinner = true
        this.pacientesService.findPatient(this.pacienteId).subscribe(data=>{
          this.paciente = data.patient
          //this.patchValuesToEdit(data.data.attributes)
          this.spinner = false
        },(error)=>{
          this.spinner = false
          console.log('ERROR', error.error.error.message)
          this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
        })
      }
    }

    goToExpediente(){
      this.router.navigate(['/patient-file', { id: this.pacienteId  }])
    }

    goToNotasEvolucion(){
      this.router.navigate(['evolution-notes', { id: this.pacienteId  }])
    }

    goToHistorialPagos(){
      this.router.navigate(['patient-payment', { id: this.pacienteId  }])
    }

    goToOdontograma(){
      this.router.navigate(['odontogram', { id: this.pacienteId }])
    }

    goToConsentimientos(){
      this.router.navigate(['informed-consents', { id: this.pacienteId }])
    }

    openSnackbar(message: string, action: string) {
      this.snackBar.open(message, action, {
        duration: 3000
      });
    }
}
