import { Component, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Concept } from '../../../core/models/concept.model';
import { Payment } from '../../../core/models/payment.model';
import { ConceptsService } from '../../../core/services/concepts.service';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-patient-payments',
  standalone: true,
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
    MatInputModule //FORM MODULES
  ],
  templateUrl: './patient-payments.component.html',
  styleUrl: './patient-payments.component.scss'
})
export class PatientPaymentsComponent {
  displayedColumns: string[] = ['fecha', 'total', 'ingreso', 'adeudo', 'actions'];
  dataSource: Payment[] = []
  patient: Patient | null = null;
  conceptList: Concept[] = []
  spinner= false
  selectedPatientId: number = 0
  constructor(private elementRef: ElementRef,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private pacientesService: PacientesService,
    private conceptsService: ConceptsService,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService
  ){}

  ngOnInit(){
    this.selectedPatientId = Number(this.route.snapshot.paramMap.get('id'));
     if(this.selectedPatientId){
      this.spinner = true
      forkJoin([
        this.pacientesService.findPatient(this.selectedPatientId),
        this.conceptsService.listConcepts(),
        this.paymentService.listPayments(this.selectedPatientId)
      ]).subscribe(
        ([pacienteData, conceptsData, paymentData]) => {
          this.patient = pacienteData.patient;
          this.conceptList = conceptsData
          this.dataSource = paymentData
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
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
  }

  openPaymentDialog(payment?: Payment){
    const dialogRef = this.dialog.open(PaymentMgmtDialogComponent,{
      width: '70vw',
      data: {
        patientData: this.patient,
        conceptsData: this.conceptList,
        paymentData: payment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        console.log('QUE PASO???', result)
        const paymentData = result
        if(payment){
          //si la informacion de payment existe, quiere decir que es un actualizar
          console.log("vamos a actualizar")
          console.log('DATA PAYMENT', payment)
          console.log('DATA EDITED', result)
          this.updatePayment(payment.id, paymentData)
        }else{
          //si la informacion de payment no existe, quiere decir que es un crear
          console.log("vamos a crear")
          this.createNewPayment(paymentData)
        }
       
      }
    });
  }

  createNewPayment(paymentData: any){
    const paymentInstance = new Payment({
      payment_date: new Date(paymentData.paymentDate),
      income: paymentData.income,
      debt: paymentData.debt,
      total: paymentData.total,
      concepts: paymentData.concepts.map((concept: any) => ({
        conceptId: concept.paymentConcept,
        payment_method: concept.paymentMethod,
        quantity: concept.quantity
      }))
    });
    this.spinner = true
    this.paymentService.createPayment(this.selectedPatientId, paymentInstance).subscribe(response=>{
      console.log("respyesta", response)
      this.reloadPaymentsData()
      this.spinner = false
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  updatePayment(paymentId: number, paymentData: any){
    console.log("vamos a actualizar")
    const paymentInstance = new Payment({
      payment_date: new Date(paymentData.paymentDate),
      income: paymentData.income,
      debt: paymentData.debt,
      total: paymentData.total,
      concepts: paymentData.concepts.map((concept: any) => ({
        id: concept.id,
        conceptId: concept.paymentConcept,
        payment_method: concept.paymentMethod,
        quantity: concept.quantity
      }))
    });
    this.spinner = true
    this.paymentService.updatePayment(paymentId, this.selectedPatientId, paymentInstance).subscribe(response=>{
      console.log("respyesta", response)
      this.reloadPaymentsData()
      this.spinner = false
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  deletePayment(paymentId: number){
    console.log('Vamos a eliminar el pago con el id', paymentId)
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Pago',
        message: '¿Seguro que quieres eliminar este pago?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.spinner = true
        this.paymentService.deletePayment(this.selectedPatientId, paymentId).subscribe(response=>{
          console.log("respyesta", response)
          this.spinner = false
          this.openSnackbar(response.msg, 'Ok')
          this.reloadPaymentsData()
        },(error)=>{
          this.spinner = false
          const errorMsg = error.error.error.message ? error.error.error.message : 'Ocurrio un problema al procesar tu solicitud'
          console.log('ERROR', errorMsg)
          this.openSnackbar(`Ocurrio un error: ${errorMsg}`, 'Ok')
        })
       
      }
    });
  }

  reloadPaymentsData(){
    this.spinner = true
    this.paymentService.listPayments(this.selectedPatientId).subscribe(response=>{
      console.log("respyesta", response)
      this.spinner = false
      this.dataSource = response
    },(error)=>{
      this.spinner = false
      console.log('ERROR', error.error.error.message)
      this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
    })
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
