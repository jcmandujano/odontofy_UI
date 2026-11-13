import { Component, ElementRef } from '@angular/core';
import { CreateEvolutionNoteRequest, EvolutionNote, UpdateEvolutionNoteRequest } from '../../../core/models/evolution-note.model';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { EvolutionNoteService } from '../../../core/services/evolution-note.service';
import { EvolutionNoteMgmtDialogComponent } from '../../../shared/dialogs/evolution-note-mgmt-dialog/evolution-note-mgmt-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-evolution-notes',
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatTableModule,
    CommonModule,
    MatPaginatorModule,
    MatButtonModule,
    NoDataFoundComponent,
    NgxSpinnerModule
  ],
  templateUrl: './evolution-notes.component.html',
  styleUrl: './evolution-notes.component.scss'
})
export class EvolutionNotesComponent {
  displayedColumns: string[] = ['fecha', 'nota', 'actions'];
  dataSource: EvolutionNote[] = [];
  notasList: EvolutionNote[] = []
  paginator: any
  pacienteId: any
  searchCriteria: string = '';
  length = 0;
  pageIndex = 1;
  pageSize = 10;
  pageEvent: PageEvent = new PageEvent;
  constructor(private notasService: EvolutionNoteService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
  }

  ngOnInit() {
    this.pacienteId = this.route.snapshot.paramMap.get('id');
    this.listarNotas(1)
  }

  limpiarHtml(html: string): string {
    // Crear un elemento temporal para usar el navegador y quitar etiquetas HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  listarNotas(page: number = 1) {
    this.spinner.show()
    this.notasService.listNotes(this.pacienteId, page, this.pageSize, this.searchCriteria).subscribe(response => {
      this.notasList = response.data?.results ?? []
      this.dataSource = this.notasList
      this.length = response.data?.total ?? 0;
      this.pageIndex = (response.data?.page ?? 1) - 1; // Ajuste base 1 ➜ base 0
      this.spinner.hide()
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', this.getErrorMessage(error))
      this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar')
    })
  }

  searchByCriteria(criteria: string) {
    this.spinner.show()
    this.notasService.findNoteByCriteria(this.pacienteId, criteria).subscribe(response => {
      this.notasList = response.data ?? []
      this.dataSource = this.notasList
      this.spinner.hide()
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', this.getErrorMessage(error))
      this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar')
    })
  }

  createNota(response: any) {
    const newNota: CreateEvolutionNoteRequest = {
      note: response.noteContent,
      occurredAt: response.creationDate
    }
    this.spinner.show()
    this.notasService.createNote(this.pacienteId, newNota).subscribe(data => {
      this.listarNotas()
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', this.getErrorMessage(error))
      this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar')
    })
  }

  editarNota(idNota: any, response: any) {
    const newNota: UpdateEvolutionNoteRequest = {
      note: response.noteContent,
      occurredAt: response.creationDate
    }
    this.spinner.show()
    this.notasService.updateNote(this.pacienteId, idNota, newNota).subscribe(data => {
      this.listarNotas()
    }, (error) => {
      this.spinner.hide()
      this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar')
    })
  }

  clearCriteria() {
    this.searchCriteria = ''
    this.listarNotas(1)
  }

  editarNotaDialog(nota: EvolutionNote) {
    const dialogRef = this.dialog.open(EvolutionNoteMgmtDialogComponent, {
      width: '760px',
      maxWidth: '96vw',
      height: '70vh',
      data: {
        note: nota
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editarNota(nota.id, result)
      }
    });
  }

  onSearch() {
    this.listarNotas(1);
  }

  eliminarNota(id: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar nota',
        message: '¿Seguro que quieres eliminar esta nota?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show()
        this.notasService.deleteNote(this.pacienteId, id).subscribe(data => {
          this.listarNotas()
          this.spinner.hide()
        }, (error) => {
          this.spinner.hide()
          this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar')
        })
      }
    });

  }

  creaNotaDialog() {
    const dialogRef = this.dialog.open(EvolutionNoteMgmtDialogComponent, {
      width: '760px',
      maxWidth: '96vw',
      height: '70vh',
      panelClass: 'custom-dialog-container',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createNota(result)
      }
    });
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.listarNotas(this.pageIndex + 1); // <-- aquí el ajuste
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  private getErrorMessage(error: any): string {
    return error?.error?.error?.message
      ?? error?.error?.message
      ?? error?.message
      ?? 'Ocurrió un problema al procesar tu solicitud';
  }

}
