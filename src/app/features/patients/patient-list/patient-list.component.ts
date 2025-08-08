import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Patient } from '../../../core/models/patient.model';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PacientesService } from '../../../core/services/patient.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-patient-list',
  imports: [
    NavBarComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    NoDataFoundComponent,
    NgxSpinnerModule
  ],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements AfterViewInit {
  displayedColumns: string[] = ['nombre', 'ingreso', 'adeudo', 'prox_cita', 'actions'];
  dataSource = new MatTableDataSource<Patient>();
  pacientesList: Patient[] = []
  length = 0;
  pageIndex = 1;
  pageSize = 10;
  pageEvent: PageEvent = new PageEvent;
  constructor(private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private pacientesService: PacientesService,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private elementRef: ElementRef) {
    this.matIconRegistry.addSvgIcon(
      "pacientes",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_user.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "iniciaCita",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_init_cita.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "editaCita",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_edit_cita.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "eliminaCita",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/dashboard_delete_cita.svg")
    );
  }

  ngOnInit(): void {
    this.recuperaPacientes()
  }


  recuperaPacientes(page: number = 0) {
    this.spinner.show()
    this.pacientesService.listPatients(page, this.pageSize).subscribe(response => {
      this.pacientesList = (response.data?.results ?? []).map(Patient.fromJson);
      this.dataSource.data = this.pacientesList
      this.length = response.data?.total ?? 0;
      this.pageIndex = (response.data?.page ?? 1) - 1; // Ajuste base 1 ➜ base 0
      //this.dataSource.paginator = this.paginator;
      this.spinner.hide()
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }


  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = '#ffffff';
  }

  //send to create new patient
  crearPaciente() {
    this.router.navigate(['/patient-file'])
  }

  editarPaciente(pacienteId: any) {
    this.router.navigate(['/patient-file', { id: pacienteId }])
  }

  goToExpediente(pacienteId: any) {
    this.router.navigate(['/patient-dashboard', { id: pacienteId }])
  }

  eliminaPaciente(pacienteId: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Paciente',
        message: '¿Seguro que quieres eliminar a este paciente?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show()
        this.pacientesService.deletePatient(pacienteId).subscribe(data => {
          this.openSnackbar('Se elimino la informacion correctamente', 'Ok')
          this.recuperaPacientes()
          this.spinner.hide()
        }, (error) => {
          this.spinner.hide()
          console.log('ERROR', error.error.error.message)
          this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
        })
      }
    });
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.recuperaPacientes(this.pageIndex + 1);
  }


  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
