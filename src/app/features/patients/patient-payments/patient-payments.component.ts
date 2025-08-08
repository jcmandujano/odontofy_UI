import { Component, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Payment } from '../../../core/models/payment.model';
import { PacientesService } from '../../../core/services/patient.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { Patient } from '../../../core/models/patient.model';
import { PaymentMgmtDialogComponent } from '../../../shared/dialogs/payment-mgmt-dialog/payment-mgmt-dialog.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
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

@Component({
  selector: 'app-patient-payments',
  imports: [
    NavBarComponent,
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
    NoDataFoundComponent
  ],
  templateUrl: './patient-payments.component.html',
  styleUrl: './patient-payments.component.scss'
})
export class PatientPaymentsComponent {
  displayedColumns: string[] = ['conceptos', 'fecha', 'total', 'ingreso', 'adeudo', 'actions'];
  dataSource: Payment[] = []
  patient: Patient | null = null;
  conceptList: UserConcept[] = []
  displayJointConcepts = ''
  spinner = false
  selectedPatientId: number = 0
  length = 0;
  pageIndex = 1;
  pageSize = 10;
  pageEvent: PageEvent = new PageEvent;
  constructor(private elementRef: ElementRef,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private pacientesService: PacientesService,
    private userConceptsService: UserConceptsService,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.selectedPatientId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.selectedPatientId) {
      this.retrievePatientPaymentData();
    }
  }

  retrievePatientPaymentData(page: number = 0) {
    this.spinner = true
    forkJoin([
      this.pacientesService.findPatient(this.selectedPatientId),
      this.userConceptsService.listUserConcepts(),
      this.paymentService.listPayments(this.selectedPatientId, page, this.pageSize)
    ]).subscribe(
      ([patientsResponse, conceptsData, paymentData]) => {
        this.patient = patientsResponse.data;
        this.conceptList = conceptsData.data?.results ?? []
        this.dataSource = (Array.isArray(paymentData.data?.results) ? paymentData.data.results : []).map((payment: Partial<Payment> | undefined) => new Payment(payment));
        this.length = paymentData.data?.total ?? 0;
        this.pageIndex = (paymentData.data?.page ?? 1) - 1;
        this.spinner = false;
      },
      error => {
        // Manejar errores para ambas llamadas
        this.spinner = false;
        console.error('Error en llamadas:', error);
        const errorMessage =
          error && error.error && error.error.error && error.error.error.message
            ? error.error.error.message
            : 'Error desconocido';

        this.openSnackbar(`Ocurrió un error: ${errorMessage}`, 'Ok');
      }
    );
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
  }

  openPaymentDialog(payment?: Payment) {
    const dialogRef = this.dialog.open(PaymentMgmtDialogComponent, {
      minWidth: '70vw',
      data: {
        patientData: this.patient,
        conceptsData: this.conceptList,
        paymentData: payment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const paymentData = result
        if (payment) {
          //si la informacion de payment existe, quiere decir que es un actualizar
          this.updatePayment(payment.id, paymentData)
        } else {
          //si la informacion de payment no existe, quiere decir que es un crear
          this.createNewPayment(paymentData)
        }

      }
    });
  }

  createNewPayment(paymentData: any) {
    const paymentInstance = new Payment({
      payment_date: new Date(paymentData.paymentDate),
      income: paymentData.income,
      debt: paymentData.debt,
      total: paymentData.total,
      concepts: paymentData.concepts.map((concept: any) => ({
        conceptId: concept.paymentConcept,
        paymentMethod: concept.paymentMethod,
        quantity: concept.quantity
      }))
    });
    this.spinner = true
    this.paymentService.createPayment(this.selectedPatientId, paymentInstance).subscribe(response => {
      this.reloadPaymentsData()
      this.spinner = false
    }, (error) => {
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  updatePayment(paymentId: number, paymentData: any) {
    const paymentInstance = new Payment({
      payment_date: new Date(paymentData.paymentDate),
      income: paymentData.income,
      debt: paymentData.debt,
      total: paymentData.total,
      concepts: paymentData.concepts.map((concept: any) => ({
        id: concept.id,
        conceptId: concept.paymentConcept,
        paymentMethod: concept.paymentMethod,
        quantity: concept.quantity
      }))
    });
    this.spinner = true
    this.paymentService.updatePayment(paymentId, this.selectedPatientId, paymentInstance).subscribe(response => {
      this.reloadPaymentsData()
      this.spinner = false
    }, (error) => {
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  deletePayment(paymentId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Pago',
        message: '¿Seguro que quieres eliminar este pago?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner = true
        this.paymentService.deletePayment(this.selectedPatientId, paymentId).subscribe(response => {
          this.spinner = false
          this.openSnackbar(response.message, 'Ok')
          this.reloadPaymentsData()
        }, (error) => {
          this.spinner = false
          const errorMsg = error.error.error.message ? error.error.error.message : 'Ocurrio un problema al procesar tu solicitud'
          console.log('ERROR', errorMsg)
          this.openSnackbar(`Ocurrio un error: ${errorMsg}`, 'Ok')
        })

      }
    });
  }

  reloadPaymentsData(page: number = 0) {
    this.spinner = true
    this.paymentService.listPayments(this.selectedPatientId, page, this.pageSize).subscribe(response => {
      this.spinner = false
      this.dataSource = (Array.isArray(response.data?.results) ? response.data.results : []).map((payment: Partial<Payment> | undefined) => new Payment(payment));
      this.length = response.data?.total ?? 0;
      this.pageIndex = (response.data?.page ?? 1) - 1;
    }, (error) => {
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
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
}
