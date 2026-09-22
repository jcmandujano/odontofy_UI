import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Patient } from '../../../core/models/patient.model';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { PacientesService } from '../../../core/services/patient.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { distinctUntilChanged, finalize, map } from 'rxjs';

@Component({
  selector: 'app-patient-list',
  imports: [
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
    NgxSpinnerModule,
    FormsModule
  ],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements AfterViewInit {
  displayedColumns: string[] = ['nombre', 'ingreso', 'adeudo', 'prox_cita', 'actions'];
  dataSource = new MatTableDataSource<Patient>();
  pacientesList: Patient[] = []
  length = 0;
  pageIndex = 0;
  pageSize = 10;
  pageEvent: PageEvent = new PageEvent;
  searchCriteria: string = '';
  constructor(private pacientesService: PacientesService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map(params => params.get('search')?.trim() ?? ''),
      distinctUntilChanged()
    ).subscribe(search => {
      this.searchCriteria = search;
      this.pageIndex = 0;
      this.recuperaPacientes();
    });
  }


  recuperaPacientes(page: number = 1) {
    this.spinner.show()
    this.pacientesService.listPatients(page, this.pageSize, this.searchCriteria).pipe(
      finalize(() => this.spinner.hide())
    ).subscribe(response => {
      this.pacientesList = (response.data?.results ?? []).map(Patient.fromJson);
      this.dataSource.data = this.pacientesList
      this.length = response.data?.total ?? 0;
      this.pageIndex = (response.data?.page ?? 1) - 1; // Ajuste base 1 ➜ base 0
      //this.dataSource.paginator = this.paginator;
      this.spinner.hide()
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrió un error: ${error.error.error.message}`, 'Aceptar')
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
        title: 'Eliminar paciente',
        message: '¿Seguro que quieres eliminar a este paciente?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show()
        this.pacientesService.deletePatient(pacienteId).subscribe(data => {
          this.openSnackbar('La información se eliminó correctamente', 'Aceptar')
          this.recuperaPacientes()
          this.spinner.hide()
        }, (error) => {
          this.spinner.hide()
          console.log('ERROR', error.error.error.message)
          this.openSnackbar(`Ocurrió un error: ${error.error.error.message}`, 'Aceptar')
        })
      }
    });
  }

  
  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: this.searchCriteria.trim() || null },
      queryParamsHandling: 'merge'
    });
  }

  clearSearch(): void {
    this.searchCriteria = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null },
      queryParamsHandling: 'merge'
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
