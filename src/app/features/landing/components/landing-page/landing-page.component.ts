import { Component, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { PrivacyTermsComponent } from '../../../../shared/dialogs/privacy-terms/privacy-terms.component';
import { TermsConditionsComponent } from '../../../../shared/dialogs/terms-conditions/terms-conditions.component';

@Component({
  selector: 'app-landing-page',
  imports: [
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  constructor(private elementRef: ElementRef, private dialog: MatDialog) { }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = '#6397e1';
  }

  ngOnInit(): void {
  }


  openPrivacyTermsDialog() {
    const dialogRef = this.dialog.open(PrivacyTermsComponent, {
      minWidth: '40vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openTermsConditionsDialog() {
    const dialogRef = this.dialog.open(TermsConditionsComponent, {
      minWidth: '40vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
