import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTable, MatTableModule } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Concept } from '../../../core/models/concept.model';
import { Payment } from '../../../core/models/payment.model';
import { Patient } from '../../../core/models/patient.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

export interface ConceptModel {
  id: number;
  paymentConcept: string;
  unitPrize: number;
  payment_method: string;
  quantity: number;
  subtotal: number;
}

const ELEMENT_DATA: ConceptModel[] = [
  { id: 1, paymentConcept: '', unitPrize: 0.00, payment_method: '',quantity: 1, subtotal: 0 }
];

const PAYMENT_METHOD_LIST = [
  {id:'CASH', description:"Efectivo"},
  {id:'CREDIT', description:"Tarjeta de Crédito"},
  {id:'DEBIT', description:"Tarjeta de Débito"},
  {id:'TRANSFER', description:"Transferencia Electronica"}

]

@Component({
  selector: 'app-payment-mgmt-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule, //FORM MODULES
    ReactiveFormsModule, //FORM MODULES
    MatInputModule //FORM MODULES
  ],
  providers: [DatePipe],
  templateUrl: './payment-mgmt-dialog.component.html',
  styleUrl: './payment-mgmt-dialog.component.scss'
})
export class PaymentMgmtDialogComponent {
  @ViewChild(MatTable)
  table!: MatTable<ConceptModel>;
  paymentFormGroup: FormGroup;
  conceptList: Concept[]
  conceptData = ELEMENT_DATA;
  selectedPatient: Patient
  income = 0;
  debt = 0
  paymentMethodList = PAYMENT_METHOD_LIST;
  paymentData: Payment
  displayedColumns: string[] = ['concept', 'unitPrize', 'paymentMethod', 'quantity', 'subtotal', 'actions'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: {patientData: Patient, conceptsData: Concept[], paymentData: Payment},
    public dialogRef: MatDialogRef<PaymentMgmtDialogComponent>,
    private fb: FormBuilder,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private datePipe: DatePipe) {

      this.paymentFormGroup = this.fb.group({
        paymentDate: [new Date(), Validators.required], 
        income: [0, Validators.required],
        debt: [0, Validators.required],
        total: [0, Validators.required],
        concepts: this.fb.array([]) // Initialize an empty FormArray
      });

    this.matIconRegistry.addSvgIcon(
      "add",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/add.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "remove",
      this.domSanitizer.bypassSecurityTrustResourceUrl("/icons/remove.svg")
    );
    this.selectedPatient = this.dialogData.patientData
    this.conceptList = this.dialogData.conceptsData
    this.paymentData = this.dialogData.paymentData
  }

  ngOnInit(): void {
    if(this.paymentData){
      this.patchValuesToEdit(this.paymentData)
    }else{
      this.conceptData.forEach((item) => {
        this.concepts.push(
          new FormGroup({
            paymentConcept: this.fb.control(item['paymentConcept'], [Validators.required]),
            unitPrize: this.fb.control(item['unitPrize'], [Validators.required]),
            payment_method: this.fb.control(item['payment_method'], [Validators.required]),
            subtotal: this.fb.control(item['subtotal'], [Validators.required]),
            quantity: this.fb.control(item['quantity'], [Validators.required]),
          })
        );
      });
    }

    
  }

  addItem() {
    const newItem: ConceptModel = {
      id: this.conceptData.length + 1, // Generar un nuevo ID único
      paymentConcept: '',
      unitPrize: 0.00,
      payment_method: '',
      quantity: 1,
      subtotal: 0,
    };

    // Agregar el nuevo item a conceptData
    this.conceptData.push(newItem);

    // Crear un nuevo FormGroup para el nuevo item
    const newItemFormGroup = this.fb.group({
      paymentConcept: [newItem.paymentConcept, Validators.required],
      unitPrize: [newItem.unitPrize, Validators.required],
      payment_method: [newItem.payment_method, Validators.required],
      quantity: [newItem.quantity, Validators.required],
      subtotal: [newItem.subtotal, Validators.required],
    });

    // Agregar el nuevo FormGroup al FormArray 'concepts'
    this.concepts.push(newItemFormGroup);
    this.table.renderRows();
  }

  removeItem(index: number){
    this.conceptData.splice(index,1)
    this.concepts.removeAt(index)
    this.table.renderRows();
  }
  
  // Helper method to get the 'items' FormArray
  get concepts() {
    return this.paymentFormGroup.get('concepts') as FormArray;
  }

  savePayment(){
    if (this.paymentFormGroup.invalid) {
      this.markFormGroupTouched(this.paymentFormGroup);
      return;
    }
    if(this.paymentFormGroup.valid){
      this.dialogRef.close(this.paymentFormGroup.value)
    }
  }

  patchValuesToEdit(payment: Payment){
    this.paymentFormGroup.patchValue({
      paymentDate: payment.payment_date,
      income: payment.income,
      debt: payment.debt,
      total: payment.total,
    });
    payment.concepts.forEach((item, index) => {
      const unitPrizeRow = this.getConceptPriceById(item.conceptId)
      const subtotalRow = unitPrizeRow * item.quantity
      this.concepts.push(
        new FormGroup({
          paymentConcept: this.fb.control(item.conceptId, [Validators.required]),
          id: this.fb.control(item.id, [Validators.required]),
          unitPrize: this.fb.control(this.getConceptPriceById(item.conceptId), [Validators.required]),
          payment_method: this.fb.control(item.payment_method, [Validators.required]),
          subtotal: this.fb.control(subtotalRow, [Validators.required]),
          quantity: this.fb.control(item.quantity, [Validators.required]),
        })
      );
    });

    this.conceptData = this.paymentData.concepts.map((element) => {
      const unitPrizeRow = this.getConceptPriceById(element.conceptId)
      const subtotalRow = unitPrizeRow * element.quantity
      return { 
        id: element.id, 
        paymentConcept: element.conceptId.toString(), 
        unitPrize: unitPrizeRow, 
        payment_method: element.payment_method,
        quantity: element.quantity, 
        subtotal: subtotalRow
      };
    });
  }

  //Return unit prize of concept on edit info
  getConceptPriceById(conceptId: number){
    const conceptFounded = this.conceptList.filter((element) =>{
      return element.id == conceptId
    })
    return conceptFounded[0].unit_price ? conceptFounded[0].unit_price : 0
  }

  // Función para obtener la fecha actual en el formato deseado
  getFechaActual(): any {
    return this.datePipe.transform(new Date(), 'dd-MM-yyyy'); // Ajusta el formato según lo necesites
  }

  //used to display patient full name
  getPatientFullName(): string{
    return this.selectedPatient.name.concat(' ').concat(this.selectedPatient.middle_name).concat(' ').concat(this.selectedPatient.last_name)
  }

  //used to calculate price, subtotal and debt on concept changes
  calculatePricesRow(selectedConceptIndex: number, formIndex: number, element: any){
    const selectedConcept = this.conceptList[selectedConceptIndex - 1]; // Obtener el concepto seleccionado
    // Actualizar el precio unitario (unitPrize) en el formulario
    this.paymentFormGroup.get(['concepts', formIndex, 'unitPrize'])?.patchValue(selectedConcept.unit_price);
    // Calcular el subtotal basado en el precio unitario y la cantidad
    const quantity = this.paymentFormGroup.get(['concepts', formIndex, 'quantity'])?.value || 0;
    const subtotal = selectedConcept.unit_price * quantity;
    // Actualizar el valor del subtotal en el formulario
    this.paymentFormGroup.get(['concepts', formIndex, 'subtotal'])?.patchValue(subtotal);
    //calculamos el total para el resumen del pago
    this.calculateTotal()
    //calculamos el adeudo
    this.calculateDebt(0)
  }

  //used to calculate subtotal by row
  calculateSubtotal(formIndex: number) {
    const conceptFormGroup = this.concepts.at(formIndex);

    const unitPrice = conceptFormGroup.get('unitPrize')?.value || 0;
    const quantity = conceptFormGroup.get('quantity')?.value || 0;
    
    const subtotal = unitPrice * quantity;
  
    conceptFormGroup.get('subtotal')?.patchValue(subtotal);
    this.calculateTotal()
    const currentIncome = this.paymentFormGroup.get('income')?.value
    console.log('currentIncome', currentIncome)
    this.calculateDebt(currentIncome)
  }

  //used to calculate total by row
  calculateTotal(){
    let total = 0;
    // Iterar sobre los controles del FormArray
    this.concepts.controls.forEach((control: AbstractControl<any>, index: number) => {
      if (control instanceof FormGroup) {
        const subtotal = control.get('subtotal')?.value || 0;
        total += subtotal;
      }
    });
    this.paymentFormGroup.get('total')?.patchValue(total)
    //return total;
  }

  //display payment grand total
  getTotal(): number {
    let total = 0;
  
    // Iterar sobre los controles del FormArray
    this.concepts.controls.forEach((control: AbstractControl<any>, index: number) => {
      if (control instanceof FormGroup) {
        const subtotal = control.get('subtotal')?.value || 0;
        total += subtotal;
      }
    });
    
    return total;
  }

  //display payment grand debt
  calculateDebt(income: number | null | undefined ){
    let debt = 0  
    let total = this.paymentFormGroup.get('total')?.value
    if((total !== null && total !== undefined) && (income !== null && income !== undefined) ){
      debt = total - income 
    }
    this.paymentFormGroup.get('debt')?.patchValue(debt)
  }

  //this method is used to mark as toucched all form groups after to save
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormArray) {
        (control as FormArray).controls.forEach(group => this.markFormGroupTouched(group as FormGroup));
      } else {
        control.markAsTouched();
      }
    });
  }
}
