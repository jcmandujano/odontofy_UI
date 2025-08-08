import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-privacy-terms',

  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './privacy-terms.component.html',
  styleUrl: './privacy-terms.component.scss'
})
export class PrivacyTermsComponent {

}
