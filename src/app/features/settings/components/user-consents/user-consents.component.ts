import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { UserConsentService } from '../../../../core/services/user-consents.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserConsentsMgmtComponent } from '../../../../shared/dialogs/user-consents-mgmt/user-consents-mgmt.component';
import { UserInformedConsent } from '../../../../core/models/user-consent.model';
import { ConfirmDialogComponent } from '../../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NoDataFoundComponent } from '../../../../shared/components/no-data-found/no-data-found.component';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";

@Component({
    selector: 'app-user-consents',
    imports: [
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        NoDataFoundComponent,
        NgxSpinnerModule
    ],
    templateUrl: './user-consents.component.html',
    styleUrl: './user-consents.component.scss'
})
export class UserConsentsComponent {
  displayedColumns: string[] = ['name', 'description', 'actions'];
  dataSource: UserInformedConsent [] = [];

  constructor(
    public dialog: MatDialog,
    public userConsentService: UserConsentService,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.listAllUserConsents()
  }


  launchAddConsentDialog(){
      const dialogRef = this.dialog.open(UserConsentsMgmtComponent, {
        width: '40vw',
        panelClass: 'custom-dialog-container' 
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.spinner.show()
          const updatedConcept = { ...result, is_custom: true };
          this.userConsentService.createUserConsent(updatedConcept).subscribe(response=>{
            this.spinner.hide()
            this.listAllUserConsents()
            this.openSnackbar('Consentimiento creado', 'Cerrar');
          }
          ,(error)=>{
            this.spinner.hide()
            console.log('ERROR', error.error.msg)
          }
          );
        }
      });
    }

    editConsent(consent: UserInformedConsent) {
      const dialogRef = this.dialog.open(UserConsentsMgmtComponent, {
        width: '40vw',
        panelClass: 'custom-dialog-container',
        data: consent
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.spinner.show()
          const updatedConsent = { ...result };
          this.userConsentService.updateUserConsent(consent.id, updatedConsent).subscribe(response => {
            this.spinner.hide()
            this.listAllUserConsents();
            this.openSnackbar('Consentimiento actualizado', 'Cerrar');
          }, (error) => {
            this.spinner.hide()
            console.log('ERROR', error.error.msg);
          });
        }
      });
    }

    deleteConsent(id: number){
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Eliminar Consentimiento Informado',
          message: '¿Seguro que quieres eliminar este consentimiento?',
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.spinner.show()
          this.userConsentService.deleteUserConsent(id).subscribe(response=>{
            this.spinner.hide()
            this.listAllUserConsents()
            this.openSnackbar('Consentimiento eliminado', 'Cerrar');
          }
          ,(error)=>{
            this.spinner.hide()
            console.log('ERROR', error.error.msg)
          }
          );
        }
      });
    }

    listAllUserConsents() {
      this.userConsentService.listUserConsent().subscribe((response) => {
        this.dataSource = response.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          file_url: item.file_url,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }));
      });
    }

    openSnackbar(message: string, action: string) {
      this.snackBar.open(message, action, {
        duration: 3000
      });
    }
  
}
