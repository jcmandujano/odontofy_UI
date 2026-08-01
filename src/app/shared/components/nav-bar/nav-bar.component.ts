import { Component, OnInit } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { Router } from '@angular/router';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

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

  constructor(private sessionService : SessionStorageService,
    private router: Router,
    private authService: AuthService
    ) {}

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
    this.authService.logout().subscribe({ complete: () => { this.sessionService.signOut(); this.router.navigate(['/login']); }, error: () => { this.sessionService.signOut(); this.router.navigate(['/login']); } });
  }

}
