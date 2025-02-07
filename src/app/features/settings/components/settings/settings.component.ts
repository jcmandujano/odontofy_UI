import { Component } from '@angular/core';
import { NavBarComponent } from '../../../../shared/components/nav-bar/nav-bar.component';
import {MatTabsModule} from '@angular/material/tabs'; 
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { UserProfileComponent } from '../user-profile/user-profile.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    NavBarComponent,
    MatTabsModule,
    MatIconModule,
    UserProfileComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

}
