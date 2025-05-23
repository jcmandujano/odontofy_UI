import { Component, Inject } from '@angular/core';
import { EvolutionNote } from '../../../core/models/evolution-note.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { QuillModule } from 'ngx-quill';

@Component({
    selector: 'app-evolution-note-mgmt-dialog',
    imports: [
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        QuillModule
    ],
    templateUrl: './evolution-note-mgmt-dialog.component.html',
    styleUrl: './evolution-note-mgmt-dialog.component.scss'
})
export class EvolutionNoteMgmtDialogComponent {
  creationDate: Date
  noteContent: string = ''
  quillConfig = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],// Tamaño de encabezado
      ['bold', 'italic', 'underline', 'strike'],// Negrita, cursiva, subrayado y tachado
      [{ 'color': [] }],//Color de texto y fondo
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],//Listas ordenadas y desordenadas
      [{ 'indent': '-1' }, { 'indent': '+1' }],//Disminuir/aumentar sangría
      [{ 'align': [] }],// Alineación de texto
      ['blockquote'],// Cita en bloque y bloque de código
      ['clean']// Botón para limpiar el formato
    ],
    scrollingContainer: 'html',// Contenedor con scroll
    bounds: 'self'// Limitar el editor dentro de un área
    
  };
  constructor(
    public dialogRef: MatDialogRef<EvolutionNoteMgmtDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EvolutionNote,
  ) {
    if(data){
      this.creationDate = new Date(data.createdAt)
      this.noteContent = data.note
    }else{
      this.creationDate = new Date()
    }
  }

  onSave(): void {
    const data = {
      creationDate: this.creationDate.toISOString(),
      noteContent: this.noteContent
    }
    this.dialogRef.close(data);
  }

  isoToDate(fechaISO: string) {
    const partes = fechaISO.split('T')[0].split('-');
    const año = partes[0];
    const mes = partes[1];
    const dia = partes[2];
    const formatoPersonalizado = `${mes}-${dia}-${año}`;
    return formatoPersonalizado;
  }

  cancel(){
    this.dialogRef.close()
  }
}
