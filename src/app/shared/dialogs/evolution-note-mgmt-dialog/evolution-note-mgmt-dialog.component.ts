import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { EvolutionNote } from '../../../core/models/evolution-note.model';
import { TreatmentPlan, TreatmentPlanItem } from '../../../core/models/treatment-plan.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QuillModule } from 'ngx-quill';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { TreatmentPlanItemStatus } from '../../../core/models/treatment-plan.model';

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
        CommonModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule,
        QuillModule
    ],
    templateUrl: './evolution-note-mgmt-dialog.component.html',
    styleUrl: './evolution-note-mgmt-dialog.component.scss'
})
export class EvolutionNoteMgmtDialogComponent {
  creationDate: Date
  noteContent: string = ''
  treatmentPlans: TreatmentPlan[] = []
  readonly generalPatientNoteValue = 'GENERAL_PATIENT_NOTE' as const
  selectedTreatmentPlanId: number | typeof this.generalPatientNoteValue = this.generalPatientNoteValue
  selectedTreatmentPlanItemId: number | null = null
  markTreatmentAsCompleted = false
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
    private treatmentPlanService: TreatmentPlanService,
  ) {
    const note = this.getDialogNote(data)
    const dialogData = this.getDialogData(data)
    this.treatmentPlans = dialogData?.treatmentPlans ?? []
    const treatmentPlanId = dialogData?.treatment_plan_id ?? note?.treatment_plan_id ?? null
    this.selectedTreatmentPlanId = treatmentPlanId ?? this.generalPatientNoteValue
    this.selectedTreatmentPlanItemId = dialogData?.treatment_plan_item_id ?? note?.treatment_plan_item_id ?? null

    if(note){
      this.creationDate = new Date(note.createdAt)
      this.noteContent = note.note
    }else{
      this.creationDate = new Date()
    }

    if (this.isGeneralPatientNote) {
      this.selectedTreatmentPlanItemId = null
    }

    this.ensureSelectedTreatmentPlanItems()
  }

  onSave(): void {
    const treatmentPlanId = this.selectedTreatmentPlanId === this.generalPatientNoteValue
      ? null
      : this.selectedTreatmentPlanId
    const treatmentPlanItemId = treatmentPlanId !== null ? this.selectedTreatmentPlanItemId ?? null : null
    const data = {
      creationDate: this.creationDate.toISOString(),
      noteContent: this.noteContent,
      treatment_plan_id: treatmentPlanId,
      treatment_plan_item_id: treatmentPlanItemId,
      markTreatmentAsCompleted: !!treatmentPlanItemId && this.markTreatmentAsCompleted
    }
    this.dialogRef.close(data);
  }

  get selectedTreatmentPlanItems(): TreatmentPlanItem[] {
    if (this.isGeneralPatientNote) {
      return []
    }

    const selectedPlan = this.treatmentPlans.find(plan => plan.id === this.selectedTreatmentPlanId)
    return selectedPlan?.TreatmentPlanItems ?? []
  }

  get isGeneralPatientNote(): boolean {
    return this.selectedTreatmentPlanId === this.generalPatientNoteValue
  }

  onTreatmentPlanChange(): void {
    this.selectedTreatmentPlanItemId = null
    this.markTreatmentAsCompleted = false
    this.ensureSelectedTreatmentPlanItems()
  }

  onTreatmentPlanItemChange(): void {
    if (!this.canMarkTreatmentAsCompleted) {
      this.markTreatmentAsCompleted = false
    }
  }

  get selectedTreatmentPlanItem(): TreatmentPlanItem | undefined {
    return this.selectedTreatmentPlanItems.find(item => item.id === this.selectedTreatmentPlanItemId)
  }

  get canMarkTreatmentAsCompleted(): boolean {
    return !!this.selectedTreatmentPlanItem && this.selectedTreatmentPlanItem.status !== TreatmentPlanItemStatus.COMPLETED
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

  private getDialogData(data: EvolutionNoteMgmtDialogData | EvolutionNote | null): EvolutionNoteMgmtDialogData | undefined {
    if (!data || !('treatmentPlans' in data || 'treatment_plan_id' in data || ('note' in data && typeof data.note !== 'string'))) {
      return undefined
    }

    return data as EvolutionNoteMgmtDialogData
  }

  private ensureSelectedTreatmentPlanItems(): void {
    if (this.selectedTreatmentPlanId === this.generalPatientNoteValue) {
      return
    }

    const treatmentPlanId = this.selectedTreatmentPlanId
    const selectedPlan = this.treatmentPlans.find(plan => plan.id === treatmentPlanId)
    if (selectedPlan?.TreatmentPlanItems) {
      return
    }

    this.treatmentPlanService.getTreatmentPlanDetail(treatmentPlanId).subscribe({
      next: response => {
        if (response.data) {
          this.treatmentPlans = this.treatmentPlans.map(plan =>
            plan.id === response.data!.id ? response.data! : plan
          )
        }
      },
      error: error => {
        console.log('ERROR', error)
      }
    })
  }
}
