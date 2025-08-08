import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';


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
    NgxSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './user-concepts.component.html',
  styleUrl: './user-concepts.component.scss'
})
export class UserConceptsComponent {
  displayedColumns: string[] = ['description', 'unit_cost', 'actions'];
  dataSource = new MatTableDataSource<UserConcept>();
  length = 0;
  pageIndex = 1;
  pageSize = 10;
  pageEvent: PageEvent = new PageEvent;
  constructor(
    public userConceptServ: UserConceptsService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.listUserConcepts()
  }

  launchAddConceptDialog() {
    const dialogRef = this.dialog.open(UserConceptsMgmtComponent, {
      width: '40vw',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show()
        const updatedConcept = { ...result, is_custom: true };
        this.userConceptServ.createUserConcept(updatedConcept).subscribe(response => {
          this.spinner.hide()
          this.listUserConcepts()
          this.openSnackbar('Concepto creado', 'Cerrar');
        }
          , (error) => {
            this.spinner.show()
            console.log('ERROR', error.error.msg)
          }
        );
      }
    });
  }

  editConcept(concept: UserConcept) {
    const dialogRef = this.dialog.open(UserConceptsMgmtComponent, {
      width: '40vw',
      data: concept
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedConcept = { ...result, is_custom: concept.is_custom };
        this.spinner.show()
        this.userConceptServ.updateUserConcept(concept.id, updatedConcept).subscribe(response => {
          this.spinner.hide()
          this.listUserConcepts()
          this.openSnackbar('Concepto actualizado', 'Cerrar');
        }
          , (error) => {
            this.spinner.hide()
            console.log('ERROR', error.error.msg)
          });
      }
    });
  }

  deleteConcept(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Concepto',
        message: '¿Seguro que quieres eliminar este concepto?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show()
        this.userConceptServ.deleteUserConcept(id).subscribe(response => {
          this.spinner.hide()
          this.listUserConcepts()
          this.openSnackbar('Concepto eliminado', 'Cerrar');
        }
          , (error) => {
            this.spinner.hide()
            console.log('ERROR', error.error.msg)
            this.openSnackbar(error.error.msg, 'Cerrar');
          }
        );
      }
    });
  }

  listUserConcepts(page: number = 0) {
    this.spinner.show()
    this.userConceptServ.listUserConcepts(page, this.pageSize).subscribe(response => {
      this.spinner.hide()
      this.dataSource = new MatTableDataSource<UserConcept>(
        (response.data?.results ?? []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          concept_id: item.concept_id,
          description: item.description,
          unit_price: parseFloat(item.unit_price),
          is_custom: item.is_custom ? item.is_custom : false,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }))
      );
      this.length = response.data?.total ?? 0;
      this.pageIndex = (response.data?.page ?? 1) - 1;
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', error.error.msg)
    })
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.listUserConcepts(this.pageIndex + 1);
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

}
