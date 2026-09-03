import { Component, ElementRef } from '@angular/core';
import { CreateEvolutionNoteRequest, EvolutionNote, UpdateEvolutionNoteRequest } from '../../../core/models/evolution-note.model';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { TreatmentPlan, TreatmentPlanItem, TreatmentPlanItemStatus } from '../../../core/models/treatment-plan.model';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { MatSelectModule } from '@angular/material/select';

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
    MatSelectModule,
    NoDataFoundComponent,
    NgxSpinnerModule
  ],
  templateUrl: './evolution-notes.component.html',
  styleUrl: './evolution-notes.component.scss'
})
export class EvolutionNotesComponent {
  displayedColumns: string[] = ['fecha', 'nota', 'planTratamiento', 'procedimiento', 'actions'];
  dataSource: EvolutionNote[] = [];
  notasList: EvolutionNote[] = []
  treatmentPlans: TreatmentPlan[] = []
  paginator: any
  pacienteId: any
  searchCriteria: string = '';
  selectedTreatmentPlanId: number | null = null;
  selectedTreatmentPlanItemId: number | null = null;
  length = 0;
  pageIndex = 1;
  pageSize = 10;
  pageEvent: PageEvent = new PageEvent;
  constructor(private notasService: EvolutionNoteService,
    private treatmentPlanService: TreatmentPlanService,
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
    this.loadTreatmentPlans()
  }

  limpiarHtml(html: string): string {
    // Crear un elemento temporal para usar el navegador y quitar etiquetas HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  listarNotas(page: number = 1) {
    this.spinner.show()
    this.notasService.listNotes(this.pacienteId, page, this.pageSize, this.searchCriteria, {
      treatment_plan_id: this.selectedTreatmentPlanId,
      treatment_plan_item_id: this.selectedTreatmentPlanItemId
    }).subscribe(response => {
      this.notasList = response.data?.results ?? []
      this.dataSource = this.notasList
      this.length = response.data?.total ?? 0;
      this.loadTreatmentPlanDetailsForNotes(this.notasList)
      this.pageIndex = (response.data?.page ?? 1) - 1; // Ajuste base 1 ➜ base 0
      this.spinner.hide()
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrió un error: ${error.error.error.message}`, 'Aceptar')
    })
  }

  loadTreatmentPlans() {
    this.treatmentPlanService.listTreatmentPlansByPatient(Number(this.pacienteId), 1, 100).subscribe({
      next: response => {
        const plans = response.data?.results ?? [];
        this.treatmentPlans = plans.map(plan => {
          const currentPlan = this.treatmentPlans.find(treatmentPlan => treatmentPlan.id === plan.id);
          return currentPlan?.TreatmentPlanItems ? currentPlan : plan;
        });
        this.loadTreatmentPlanDetailsForNotes(this.notasList);
      },
      error: error => {
        this.openSnackbar(`Ocurrió un error al cargar los planes: ${this.getErrorMessage(error)}`, 'Aceptar')
      }
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
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrió un error: ${error.error.error.message}`, 'Aceptar')
    })
  }

  createNota(response: any) {
    const newNota: CreateEvolutionNoteRequest = {
      note: response.noteContent,
      treatment_plan_id: response.treatment_plan_id ?? null,
      treatment_plan_item_id: response.treatment_plan_id ? response.treatment_plan_item_id ?? null : null
    }
    this.spinner.show()
    this.notasService.createNote(this.pacienteId, newNota).subscribe(data => {
      this.completeTreatmentItemIfRequested(response, () => {
        this.listarNotas()
        this.spinner.hide()
      })
    }, (error) => {
      this.spinner.hide()
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrió un error: ${error.error.error.message}`, 'Aceptar')
    })
  }

  editarNota(idNota: any, response: any) {
    const newNota: UpdateEvolutionNoteRequest = {
      note: response.noteContent,
      treatment_plan_id: response.treatment_plan_id ?? null,
      treatment_plan_item_id: response.treatment_plan_id ? response.treatment_plan_item_id ?? null : null
    }
    this.spinner.show()
    this.notasService.updateNote(this.pacienteId, idNota, newNota).subscribe(data => {
      this.completeTreatmentItemIfRequested(response, () => {
        this.listarNotas()
        this.spinner.hide()
      })
    }, (error) => {
      this.spinner.hide()
      this.openSnackbar(`Ocurrió un error: ${error.error.error.message}`, 'Aceptar')
    })
  }

  clearCriteria() {
    this.searchCriteria = ''
    this.listarNotas(1)
  }

  clearClinicalFilters() {
    this.selectedTreatmentPlanId = null
    this.selectedTreatmentPlanItemId = null
    this.pageIndex = 0
    this.listarNotas(1)
  }

  onTreatmentPlanFilterChange() {
    this.selectedTreatmentPlanItemId = null
    this.pageIndex = 0
    this.ensureSelectedTreatmentPlanItems()
    this.listarNotas(1)
  }

  onTreatmentPlanItemFilterChange() {
    this.pageIndex = 0
    this.listarNotas(1)
  }

  editarNotaDialog(nota: EvolutionNote) {
    const dialogRef = this.dialog.open(EvolutionNoteMgmtDialogComponent, {
      minWidth: '40vw',
      height: '70vh',
      data: {
        note: nota,
        treatmentPlans: this.treatmentPlans
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
          this.openSnackbar(`Ocurrió un error: ${error.error.error.message}`, 'Aceptar')
        })
      }
    });

  }

  creaNotaDialog() {
    const dialogRef = this.dialog.open(EvolutionNoteMgmtDialogComponent, {
      minWidth: '40vw',
      height: '70vh',
      panelClass: 'custom-dialog-container',
      data: {
        treatmentPlans: this.treatmentPlans,
        treatment_plan_id: this.selectedTreatmentPlanId,
        treatment_plan_item_id: this.selectedTreatmentPlanItemId
      }
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

  get selectedTreatmentPlanItems(): TreatmentPlanItem[] {
    const selectedPlan = this.treatmentPlans.find(plan => plan.id === this.selectedTreatmentPlanId)
    return selectedPlan?.TreatmentPlanItems ?? []
  }

  getTreatmentPlanTitle(note: EvolutionNote): string {
    if (!note.treatment_plan_id) {
      return 'Nota general de paciente'
    }

    const treatmentPlan = this.treatmentPlans.find(plan => plan.id === note.treatment_plan_id)
    return treatmentPlan?.title ?? `Plan #${note.treatment_plan_id}`
  }

  getTreatmentPlanItemDescription(note: EvolutionNote): string {
    if (!note.treatment_plan_item_id) {
      return ''
    }

    const treatmentPlan = this.treatmentPlans.find(plan => plan.id === note.treatment_plan_id)
    const item = treatmentPlan?.TreatmentPlanItems?.find(planItem => planItem.id === note.treatment_plan_item_id)
    return item?.name ?? ''
  }

  getItemLabel(item: TreatmentPlanItem): string {
    const details = [item.tooth ? `Diente ${item.tooth}` : '', item.area ?? ''].filter(Boolean).join(' - ')
    return details ? `${item.name} (${details})` : item.name
  }

  private getErrorMessage(error: any): string {
    return error?.error?.error?.message
      ?? error?.error?.message
      ?? error?.message
      ?? 'Ocurrió un problema al procesar tu solicitud';
  }

  private ensureSelectedTreatmentPlanItems() {
    if (!this.selectedTreatmentPlanId) {
      return
    }

    this.ensureTreatmentPlanItems(this.selectedTreatmentPlanId)
  }

  private loadTreatmentPlanDetailsForNotes(notes: EvolutionNote[]): void {
    const planIds = [...new Set(
      notes
        .filter(note => note.treatment_plan_id && note.treatment_plan_item_id)
        .map(note => note.treatment_plan_id as number)
    )]

    planIds.forEach(planId => this.ensureTreatmentPlanItems(planId))
  }

  private ensureTreatmentPlanItems(treatmentPlanId: number): void {
    const treatmentPlan = this.treatmentPlans.find(plan => plan.id === treatmentPlanId)
    if (treatmentPlan?.TreatmentPlanItems) {
      return
    }

    this.treatmentPlanService.getTreatmentPlanDetail(treatmentPlanId).subscribe({
      next: response => {
        if (response.data) {
          this.upsertTreatmentPlan(response.data)
        }
      },
      error: error => {
        this.openSnackbar(`Ocurrió un error al cargar los procedimientos del plan: ${this.getErrorMessage(error)}`, 'Aceptar')
      }
    })
  }

  private completeTreatmentItemIfRequested(response: any, onComplete: () => void): void {
    if (!response.markTreatmentAsCompleted || !response.treatment_plan_id || !response.treatment_plan_item_id) {
      onComplete()
      return
    }

    this.treatmentPlanService.updateTreatmentPlanItemStatus(
      response.treatment_plan_id,
      response.treatment_plan_item_id,
      { status: TreatmentPlanItemStatus.COMPLETED }
    ).subscribe({
      next: () => {
        this.openSnackbar('La nota se guardó y el tratamiento se marcó como completado', 'Aceptar')
        this.refreshTreatmentPlanDetail(response.treatment_plan_id)
        onComplete()
      },
      error: error => {
        this.spinner.hide()
        this.openSnackbar(`La nota se guardó, pero no se pudo completar el tratamiento: ${this.getErrorMessage(error)}`, 'Aceptar')
      }
    })
  }

  private refreshTreatmentPlanDetail(treatmentPlanId: number): void {
    this.treatmentPlanService.getTreatmentPlanDetail(treatmentPlanId).subscribe({
      next: response => {
        if (response.data) {
          this.upsertTreatmentPlan(response.data)
        }
      },
      error: error => {
        this.openSnackbar(`Ocurrió un error al actualizar el plan: ${this.getErrorMessage(error)}`, 'Aceptar')
      }
    })
  }

  private upsertTreatmentPlan(treatmentPlan: TreatmentPlan): void {
    const currentPlanIndex = this.treatmentPlans.findIndex(plan => plan.id === treatmentPlan.id)
    if (currentPlanIndex === -1) {
      this.treatmentPlans = [...this.treatmentPlans, treatmentPlan]
      return
    }

    this.treatmentPlans = this.treatmentPlans.map(plan =>
      plan.id === treatmentPlan.id ? treatmentPlan : plan
    )
  }
}
