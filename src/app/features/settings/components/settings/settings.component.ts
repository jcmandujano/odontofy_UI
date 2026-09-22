import { Component } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs'; 
import { MatIconModule } from '@angular/material/icon';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { UserConceptsComponent } from '../user-concepts/user-concepts.component';
import { UserConsentsComponent } from '../user-consents/user-consents.component';

@Component({
    selector: 'app-settings',
    imports: [
        MatTabsModule,
        MatIconModule,
        UserProfileComponent,
        UserConceptsComponent,
        UserConsentsComponent
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent {

}
