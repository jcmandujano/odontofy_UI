import { Component, ElementRef } from '@angular/core';
import { EvolutionNote } from '../../../core/models/evolution-note.model';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { EvolutionNoteService } from '../../../core/services/evolution-note.service';
import { EvolutionNoteMgmtDialogComponent } from '../../../shared/dialogs/evolution-note-mgmt-dialog/evolution-note-mgmt-dialog.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';

@Component({
    selector: 'app-evolution-notes',
    imports: [
        NavBarComponent,
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
        NoDataFoundComponent
    ],
    templateUrl: './evolution-notes.component.html',
    styleUrl: './evolution-notes.component.scss'
})
export class EvolutionNotesComponent {
  displayedColumns: string[] = ['fecha', 'nota', 'actions'];
  dataSource: EvolutionNote[] = [];
  spinner= false
  notasList: EvolutionNote[] = []
  paginator: any
  pacienteId: any
  searchCriteria: string = ''
  constructor(private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer, 
    private notasService: EvolutionNoteService, 
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public dialog: MatDialog,
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

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
  }

  ngOnInit(){
    this.pacienteId = this.route.snapshot.paramMap.get('id');
    this.listarNotas()
  }

  limpiarHtml(html: string): string {
    // Crear un elemento temporal para usar el navegador y quitar etiquetas HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  listarNotas(){
    this.spinner = true
    this.notasService.listNotes(this.pacienteId).subscribe(data=>{
      this.notasList = data.notes
      this.dataSource = this.notasList
      this.spinner = false
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  searchByCriteria(criteria: string){
    this.spinner = true
    this.notasService.findNote(this.pacienteId, criteria).subscribe(data=>{
      this.notasList = data
      this.dataSource = this.notasList
      this.spinner = false
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  createNota(response: any){
    const newNota = new EvolutionNote()
    newNota.patient_id = this.pacienteId
    newNota.note = response.noteContent
    this.spinner = true
    this.notasService.createNote(this.pacienteId, newNota).subscribe(data=>{
      this.listarNotas()
      this.spinner = false
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  editarNota(idNota: any, response: any){
    const newNota = new EvolutionNote()
    newNota.patient_id = this.pacienteId
    newNota.note = response.noteContent
    this.spinner = true
     this.notasService.updateNote(this.pacienteId, idNota, newNota).subscribe(data=>{
      this.listarNotas()
      this.spinner = false
    },(error)=>{
      this.spinner = false
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  clearCriteria(){
    this.searchCriteria = ''
    this.listarNotas()
  }

  editarNotaDialog(nota: EvolutionNote){
    const dialogRef = this.dialog.open(EvolutionNoteMgmtDialogComponent, {
      minWidth: '40vw',
      height: '70vh',
      data: nota
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.editarNota(nota.id, result)
      }
    });
  }

  onEnterKey(event: any) {
    if (event.key === 'Enter') {
      this.searchByCriteria(this.searchCriteria || '')
    }
  }

  eliminarNota(id:any){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Nota',
        message: '¿Seguro que quieres eliminar esta nota?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.spinner = true
        this.notasService.deleteNote(this.pacienteId, id).subscribe(data=>{
          this.listarNotas()
          this.spinner = false
        },(error)=>{
          this.spinner = false
          this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
        })
      }
    });
    
  }

  creaNotaDialog(){
    const dialogRef = this.dialog.open(EvolutionNoteMgmtDialogComponent, {
      minWidth: '40vw',
      height: '70vh',
      panelClass: 'custom-dialog-container' 
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.createNota(result)
      }
    });
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
