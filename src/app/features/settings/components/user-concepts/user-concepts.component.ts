import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { UserConceptsService } from '../../../../core/services/user-concepts.service';
import { UserConcept } from '../../../../core/models/user-concept.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserConceptsMgmtComponent } from '../../../../shared/dialogs/user-concepts-mgmt/user-concepts-mgmt.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NoDataFoundComponent } from '../../../../shared/components/no-data-found/no-data-found.component';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";


@Component({
    selector: 'app-user-concepts',
    imports: [
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        CommonModule,
        MatCardModule,
        NoDataFoundComponent,
        NgxSpinnerModule
    ],
    templateUrl: './user-concepts.component.html',
    styleUrl: './user-concepts.component.scss'
})
export class UserConceptsComponent {
  displayedColumns: string[] = ['description', 'unit_cost', 'actions'];
  dataSource: UserConcept[] = [];
  constructor(
    public userConceptServ: UserConceptsService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService
  ) {}  
  
  ngOnInit() {
    this.listUserConcepts()
  }

  launchAddConceptDialog(){
    const dialogRef = this.dialog.open(UserConceptsMgmtComponent, {
      width: '40vw',
      panelClass: 'custom-dialog-container' 
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.spinner.show()
        const updatedConcept = { ...result, is_custom: true };
        this.userConceptServ.createUserConcept(updatedConcept).subscribe(response=>{
          this.spinner.hide()
          this.listUserConcepts()
          this.openSnackbar('Concepto creado', 'Cerrar');
        }
        ,(error)=>{
          this.spinner.show()
          console.log('ERROR', error.error.msg)
        }
        );
      }
    });
  }

  editConcept(concept: UserConcept){
    const dialogRef = this.dialog.open(UserConceptsMgmtComponent, {
      width: '40vw',
      data: concept
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        const updatedConcept = { ...result, is_custom: concept.is_custom };
        this.spinner.show()
        this.userConceptServ.updateUserConcept(concept.id, updatedConcept).subscribe(response=>{
          this.spinner.hide()
          this.listUserConcepts()
          this.openSnackbar('Concepto actualizado', 'Cerrar');
        }
        ,(error)=>{
          this.spinner.hide()
          console.log('ERROR', error.error.msg)
        });
      }
    });
  }

  deleteConcept(id: number){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Concepto',
        message: '¿Seguro que quieres eliminar este concepto?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.spinner.show()
        this.userConceptServ.deleteUserConcept(id).subscribe(response=>{
          this.spinner.hide()
          this.listUserConcepts()
          this.openSnackbar('Concepto eliminado', 'Cerrar');
        }
        ,(error)=>{
          this.spinner.hide()
          console.log('ERROR', error.error.msg)
          this.openSnackbar(error.error.msg, 'Cerrar');
        }
        );
      }
    });
  }

  listUserConcepts(){
    this.spinner.show()
    this.userConceptServ.listUserConcepts().subscribe(response=>{
      this.spinner.hide()
      this.dataSource = response.map((item: any) => ({
        id: item.id,
        description: item.description,
        unit_price: parseFloat(item.unit_price),
        is_custom: item.is_custom ? item.is_custom : false,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    },(error)=>{
      this.spinner.hide()
      console.log('ERROR', error.error.msg)
    })
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

}
