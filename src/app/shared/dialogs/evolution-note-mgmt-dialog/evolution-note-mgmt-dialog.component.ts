
import { Component, Inject } from '@angular/core';
import { EvolutionNote } from '../../../core/models/evolution-note.model';
import { TreatmentPlan } from '../../../core/models/treatment-plan.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { QuillModule } from 'ngx-quill';

export interface EvolutionNoteMgmtDialogData {
  note?: EvolutionNote;
  treatmentPlans?: TreatmentPlan[];
  treatment_plan_id?: number | null;
  treatment_plan_item_id?: number | null;
}

export interface EvolutionNoteMgmtDialogResult {
  creationDate: string;
  noteContent: string;
  treatment_plan_id: number | null;
  treatment_plan_item_id: number | null;
  markTreatmentAsCompleted: boolean;
}

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
  private originalNote?: EvolutionNote;
  get dialogTitle(): string { return this.originalNote ? 'Editar nota' : 'Nueva nota'; }
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
    @Inject(MAT_DIALOG_DATA) public data: EvolutionNoteMgmtDialogData | EvolutionNote | null,
  ) {
    const note = this.getDialogNote(data)
    this.originalNote = note;

    if(note){
      this.creationDate = new Date(note.createdAt)
      this.noteContent = note.note
    }else{
      this.creationDate = new Date()
    }

  }

  onSave(): void {
    const occurredAt = this.creationDate?.toISOString();
    if (!occurredAt || !Number.isFinite(Date.parse(occurredAt)) || !this.noteContent.trim()) return;
    const data = {
      creationDate: occurredAt,
      noteContent: this.noteContent,
      treatment_plan_id: this.originalNote?.treatment_plan_id ?? null,
      treatment_plan_item_id: this.originalNote?.treatment_plan_item_id ?? null,
      markTreatmentAsCompleted: false
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

  private getDialogNote(data: EvolutionNoteMgmtDialogData | EvolutionNote | null): EvolutionNote | undefined {
    if (!data) {
      return undefined
    }

    if ('note' in data && typeof data.note !== 'string') {
      return data.note
    }

    if ('note' in data && typeof data.note === 'string') {
      return data as EvolutionNote
    }

    return undefined
  }

}
