import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import {MatIconModule} from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

import { User } from '../../core/models/user.model';
import { SessionStorageService } from '../../core/services/session-storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  numbers: number[];
  currentUser: User = new User;

  constructor(private sessionService : SessionStorageService,
  private router: Router, 
  private elementRef: ElementRef,
  private matIconRegistry: MatIconRegistry,
  private domSanitizer: DomSanitizer) {
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

    //usado para iterar n veces la lista de citas en la agenda
    this.numbers = Array(8).fill(0).map((x,i)=>i); // [0,1,2,3,4]
   }
  //faEnvelope = faEnvelope;
  ngOnInit(): void {
    this.currentUser = this.sessionService.getUser();
  }

  ngAfterViewInit(){
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#f6f9fd';
  }

  doLogout(){
    this.sessionService.signOut();
    this.router.navigate([''])
  }

  crearPaciente(){
    this.router.navigate(['patient-file'])
  }

  listadePacientes(){
    this.router.navigate(['patient-list'])
  }

  goToAgenda(){
    this.router.navigate(['schedule'])
  }

}
