import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SessionStorageService } from './core/services/session-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isLoggedIn = false;
  title = 'odontofyUI';
  constructor(private tokenStorageService: SessionStorageService,
    private router: Router) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.router.navigate(['/dashboard'])
    }else{
      this.router.navigate([''])
    }
  }
}
