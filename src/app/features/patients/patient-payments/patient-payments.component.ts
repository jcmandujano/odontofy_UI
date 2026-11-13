import { Component, ElementRef, ViewChild } from '@angular/core';
import { TreatmentFinanceComponent } from '../../../shared/components/treatment-finance/treatment-finance.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BillingInstallmentDialogComponent } from '../../../shared/dialogs/billing-installment-dialog/billing-installment-dialog.component';
import { Payment } from '../../../core/models/payment.model';
import { PacientesService } from '../../../core/services/patient.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { Patient } from '../../../core/models/patient.model';
import {
  PaymentDialogResult,
  PaymentMgmtDialogComponent,
} from '../../../shared/dialogs/payment-mgmt-dialog/payment-mgmt-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserConcept } from '../../../core/models/user-concept.model';
import { UserConceptsService } from '../../../core/services/user-concepts.service';
import { NoDataFoundComponent } from '../../../shared/components/no-data-found/no-data-found.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-patient-payments',
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatTableModule,
    CommonModule,
    MatPaginatorModule,
    MatButtonModule,
    MatFormFieldModule, //FORM MODULES
    ReactiveFormsModule, //FORM MODULES
    MatInputModule, //FORM MODULES
    NoDataFoundComponent,
    NgxSpinnerModule
    , TreatmentFinanceComponent
  ],
  templateUrl: './patient-payments.component.html',
  styleUrl: './patient-payments.component.scss'
})
export class PatientPaymentsComponent {
  @ViewChild(TreatmentFinanceComponent) finance?: TreatmentFinanceComponent;
  displayedColumns: string[] = ['conceptos', 'fecha', 'total', 'descuento', 'ingreso', 'adeudo', 'actions'];
  dataSource: Payment[] = []
  patient: Patient | null = null;
  conceptList: UserConcept[] = []
  hasTreatmentFinance = false;
  showPreviousFinance = false;
  private paymentDialogOpen = false;
  displayJointConcepts = ''
  selectedPatientId: number = 0
  length = 0;
  pageIndex = 0;
  pageSize = 10;
  pageEvent: PageEvent = new PageEvent;
  constructor(private elementRef: ElementRef,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private pacientesService: PacientesService,
    private userConceptsService: UserConceptsService,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.selectedPatientId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.selectedPatientId) {
      this.retrievePatientPaymentData();
    }
  }

  retrievePatientPaymentData(page: number = 1) {
    this.spinner.show()
    forkJoin([
      this.pacientesService.findPatient(this.selectedPatientId),
      this.userConceptsService.listAllUserConcepts(),
      this.paymentService.listPayments(this.selectedPatientId, page, this.pageSize)
    ]).subscribe(
      ([patientsResponse, conceptsData, paymentData]) => {
        this.patient = patientsResponse.data;
        this.conceptList = conceptsData
        this.hasTreatmentFinance = paymentData.meta?.hasTreatmentFinance ?? false
        this.dataSource = (Array.isArray(paymentData.data?.results) ? paymentData.data.results : []).map((payment: Partial<Payment> | undefined) => new Payment(payment));
        this.length = paymentData.data?.total ?? 0;
        this.pageIndex = (paymentData.data?.page ?? 1) - 1;
        this.spinner.hide();
      },
      error => {
        // Manejar errores para ambas llamadas
        this.spinner.hide();
        this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar');
      }
    );
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
  }

  openPaymentDialog(payment?: Payment) {
    if (this.paymentDialogOpen) return;
    if (payment?.recordKind === 'TREATMENT_PAYMENT' || payment?.sourceBillingRecordId || payment?.hasInstallments) return;

    //if there is no contepts we show a message and return
    if (!payment && this.conceptList.length === 0) {
      this.openSnackbar('No hay tratamientos disponibles. Por favor, crea un tratamiento en tus configuraciones antes de agregar un pago.', 'Ok');
      return;
    }

    this.paymentDialogOpen = true;
    const key = crypto.randomUUID();
    const dialogRef = this.dialog.open(PaymentMgmtDialogComponent, {
      width: '96vw',
      maxWidth: '1100px',
      maxHeight: '90vh',
      data: {
        patientData: this.patient,
        conceptsData: this.conceptList,
        paymentData: payment,
        submit: (result: PaymentDialogResult) => payment
          ? this.paymentService.updatePayment(payment.id, this.selectedPatientId, this.paymentFromResult(result))
          : this.paymentService.createPayment(this.selectedPatientId, this.paymentFromResult(result), key)
      }
    });

    dialogRef.afterClosed().subscribe(result => { this.paymentDialogOpen = false; if (result) this.reloadPaymentsData(); });
  }

  private paymentFromResult(result: PaymentDialogResult): Payment {
    return new Payment({
      payment_date: result.paymentDate, income: result.income, discount: result.discount,
      concepts: result.concepts.map(concept => ({ conceptId: concept.paymentConcept, paymentMethod: concept.paymentMethod, quantity: concept.quantity }))
    });
  }

  openInstallment(payment: Payment): void {
    if (this.paymentDialogOpen) return;
    if (payment.recordKind === 'TREATMENT_PAYMENT' || payment.sourceBillingRecordId || !(Number(payment.outstandingAmount) > 0)) return;
    this.paymentDialogOpen = true;
    this.dialog.open(BillingInstallmentDialogComponent, {
      width: '480px', maxWidth: '96vw', maxHeight: '90vh',
      data: { patientId: this.selectedPatientId, payment }
    }).afterClosed().subscribe(saved => { this.paymentDialogOpen = false; if (saved) this.reloadPaymentsData(); });
  }

  deletePayment(paymentId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar pago',
        message: '¿Seguro que quieres eliminar este pago?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show()
        this.paymentService.deletePayment(this.selectedPatientId, paymentId).subscribe(response => {
          this.openSnackbar(response.message, 'Ok')
          this.reloadPaymentsData()
        }, (error) => {
          this.spinner.hide()
          this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar')
        })

      }
    });
  }

  reloadPaymentsData(page: number = 1) {
    this.finance?.load();
    this.spinner.show()
    this.paymentService.listPayments(this.selectedPatientId, page, this.pageSize).subscribe(response => {
      this.spinner.hide()
      this.hasTreatmentFinance = response.meta?.hasTreatmentFinance ?? false
      this.dataSource = (Array.isArray(response.data?.results) ? response.data.results : []).map((payment: Partial<Payment> | undefined) => new Payment(payment));
      this.length = response.data?.total ?? 0;
      this.pageIndex = (response.data?.page ?? 1) - 1;
    }, (error) => {
      this.spinner.hide()
      this.openSnackbar(`Ocurrió un error: ${this.getErrorMessage(error)}`, 'Aceptar')
    })
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.reloadPaymentsData(this.pageIndex + 1);
  }


  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  private getErrorMessage(error: unknown): string {
    const apiError = error as {
      error?: {
        message?: string;
        error?: { message?: string };
      };
    };

    return apiError?.error?.message
      ?? apiError?.error?.error?.message
      ?? 'Ocurrió un problema al procesar tu solicitud';
  }
}
