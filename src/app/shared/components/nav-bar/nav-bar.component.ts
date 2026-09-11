import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { Router, RouterLink } from '@angular/router';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        RouterLink
    ],
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  @Input() activeSection = 'dashboard';
  @Input() collapsed = true;
  @Output() readonly collapsedChange = new EventEmitter<boolean>();

  constructor(private sessionService : SessionStorageService,
    private router: Router,
    private authService: AuthService
    ) {}

  get currentUser(): User {
    return this.sessionService.getUser();
  }

  get userName(): string {
    return [this.currentUser.name, this.currentUser.middle_name, this.currentUser.last_name]
      .filter(Boolean)
      .join(' ') || 'Mi cuenta';
  }

  get userInitials(): string {
    const names = [this.currentUser.name, this.currentUser.last_name].filter(Boolean);
    return names.map(name => String(name).charAt(0)).join('').toUpperCase() || 'OD';
  }

  toggleCollapsed(): void {
    this.collapsedChange.emit(!this.collapsed);
  }

  doLogout(): void {
    this.authService.logout().subscribe({ complete: () => { this.sessionService.signOut(); this.router.navigate(['/login']); }, error: () => { this.sessionService.signOut(); this.router.navigate(['/login']); } });
  }

}
