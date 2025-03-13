import { Component, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-nav-bar',
    imports: [
        MatIconModule,
        MatToolbarModule,
        MatButtonModule
    ],
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(private matIconRegistry: MatIconRegistry,  
    private domSanitizer: DomSanitizer,
    private sessionService : SessionStorageService,
    private router: Router
    ) {
    this.matIconRegistry.addSvgIcon(
      "logout",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/logout_dashboard.svg")
    );
   }

  ngOnInit(): void {
  }

  goToDashboard(){
    this.router.navigate(['dashboard'])
  }

  goToPatients(){
    this.router.navigate(['patient-list'])
  }

  goToAgenda(){
    this.router.navigate(['schedule'])
  }

  goToConfig(){
    this.router.navigate(['settings'])
  }

  doLogout(){
    this.sessionService.signOut();
    this.router.navigate([''])
  }

}
