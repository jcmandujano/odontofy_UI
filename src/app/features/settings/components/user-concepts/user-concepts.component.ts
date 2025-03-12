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


@Component({
  selector: 'app-user-concepts',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
    MatCardModule,
    NoDataFoundComponent
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
    public dialog: MatDialog
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
        const updatedConcept = { ...result, is_custom: true };
        this.userConceptServ.createUserConcept(updatedConcept).subscribe(response=>{
          this.listUserConcepts()
          this.openSnackbar('Concepto creado', 'Cerrar');
        }
        ,(error)=>{
          console.log('ERROR', error.error.error.message)
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
        this.userConceptServ.updateUserConcept(concept.id, updatedConcept).subscribe(response=>{
          this.listUserConcepts()
          this.openSnackbar('Concepto actualizado', 'Cerrar');
        }
        ,(error)=>{
          console.log('ERROR', error.error.error.message)
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
        this.userConceptServ.deleteUserConcept(id).subscribe(response=>{
          this.listUserConcepts()
          this.openSnackbar('Concepto eliminado', 'Cerrar');
        }
        ,(error)=>{
          console.log('ERROR', error.error.msg)
          this.openSnackbar(error.error.msg, 'Cerrar');
        }
        );
      }
    });
  }

  listUserConcepts(){
    this.userConceptServ.listUserConcepts().subscribe(response=>{
      this.dataSource = response.map((item: any) => ({
        id: item.id,
        description: item.description,
        unit_price: parseFloat(item.unit_price),
        is_custom: item.is_custom ? item.is_custom : false,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    },(error)=>{
      console.log('ERROR', error.error.error.message)
    })
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

}
