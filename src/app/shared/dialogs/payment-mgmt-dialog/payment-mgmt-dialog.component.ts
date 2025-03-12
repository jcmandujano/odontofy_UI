import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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
import { UserConcept } from '../../../core/models/user-concept.model';

export interface ConceptModel {
  id: number;
  paymentConcept: string;
  unitPrize: string;
  paymentMethod: string;
  quantity: number;
  subtotal: string;
}

const ELEMENT_DATA: ConceptModel[] = [
  { id: 1, paymentConcept: '', unitPrize: "0.00", paymentMethod: '',quantity: 1, subtotal: "0" }
];

const PAYMENT_METHOD_LIST = [
  {id:'CASH', description:"Efectivo"},
  {id:'CREDIT', description:"Tarjeta de Crédito"},
  {id:'DEBIT', description:"Tarjeta de Débito"},
  {id:'TRANSFERENCE', description:"Transferencia Electronica"}

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
  providers: [DatePipe, CurrencyPipe],
  templateUrl: './payment-mgmt-dialog.component.html',
  styleUrl: './payment-mgmt-dialog.component.scss',
  
})
export class PaymentMgmtDialogComponent {
  @ViewChild(MatTable)
  table!: MatTable<ConceptModel>;
  paymentFormGroup: FormGroup;
  conceptList: UserConcept[]
  conceptData = ELEMENT_DATA;
  selectedPatient: Patient
  income = 0;
  debt = 0
  paymentMethodList = PAYMENT_METHOD_LIST;
  paymentData: Payment
  displayedColumns: string[] = ['concept', 'unitPrize', 'paymentMethod', 'quantity', 'subtotal', 'actions'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: {patientData: Patient, conceptsData: UserConcept[], paymentData: Payment},
    public dialogRef: MatDialogRef<PaymentMgmtDialogComponent>,
    private fb: FormBuilder,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe) {

      this.paymentFormGroup = this.fb.group({
        paymentDate: [new Date(), Validators.required], 
        income: ['MX$0.00', Validators.required],
        debt: ['MX$0.00', Validators.required],
        total: ['MX$0.00', Validators.required],
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
            paymentMethod: this.fb.control(item['paymentMethod'], [Validators.required]),
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
      unitPrize: "MX$0.00",
      paymentMethod: '',
      quantity: 1,
      subtotal: "MX$0.00",
    };

    // Agregar el nuevo item a conceptData
    this.conceptData.push(newItem);

    // Crear un nuevo FormGroup para el nuevo item
    const newItemFormGroup = this.fb.group({
      paymentConcept: [newItem.paymentConcept, Validators.required],
      unitPrize: [newItem.unitPrize, Validators.required],
      paymentMethod: [newItem.paymentMethod, Validators.required],
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

    //calculamos el total para el resumen del pago
    this.calculateTotal()
    
    //calculamos el adeudo
    this.calculateDebt(0)
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
      const fieldsToFormat = ['income', 'debt', 'total', 'unitPrize', 'subtotal'];
      this.removeCurrencyFormatFromFields(this.paymentFormGroup, fieldsToFormat);
      this.dialogRef.close(this.paymentFormGroup.value)
    }
  }

  patchValuesToEdit(payment: Payment){
    this.paymentFormGroup.patchValue({
      paymentDate: payment.payment_date,
      income: this.currencyPipe.transform(payment.income, 'MXN', 'symbol') ?? '',
      debt: this.currencyPipe.transform(payment.debt, 'MXN', 'symbol') ?? '',
      total: this.currencyPipe.transform(payment.total, 'MXN', 'symbol') ?? '',
    });
    payment.concepts.forEach((item, index) => {
      const unitPrizeRow = this.getConceptPriceById(item.conceptId)
      const formattedUnitPrizeRow = this.currencyPipe.transform(unitPrizeRow, 'MXN', 'symbol') ?? ''
      const subtotalRow = unitPrizeRow * item.quantity
      const formattedSubtotal = this.currencyPipe.transform(subtotalRow, 'MXN', 'symbol') ?? ''
      this.concepts.push(
        new FormGroup({
          paymentConcept: this.fb.control(item.conceptId, [Validators.required]),
          id: this.fb.control(item.id, [Validators.required]),
          unitPrize: this.fb.control(formattedUnitPrizeRow, [Validators.required]),
          paymentMethod: this.fb.control(item.paymentMethod, [Validators.required]),
          subtotal: this.fb.control(formattedSubtotal, [Validators.required]),
          quantity: this.fb.control(item.quantity, [Validators.required]),
        })
      );
    });

    this.conceptData = this.paymentData.concepts.map((element) => {
      const unitPrizeRow = this.getConceptPriceById(element.conceptId)
      const formattedUnitPrizeRow = this.currencyPipe.transform(unitPrizeRow, 'MXN', 'symbol') ?? ''
      const subtotalRow = unitPrizeRow * element.quantity
       const formattedSubtotal = this.currencyPipe.transform(subtotalRow, 'MXN', 'symbol') ?? ''
      return { 
        id: element.id, 
        paymentConcept: element.conceptId.toString(), 
        unitPrize: formattedUnitPrizeRow, 
        paymentMethod: element.paymentMethod,
        quantity: element.quantity, 
        subtotal: formattedSubtotal
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
  calculatePricesRow(conceptId: number, formIndex: number, element: any){
    // Obtener el concepto seleccionado por medio del id
    const selectedConcept = this.conceptList.find((element) => element.id == conceptId)
    
    // Actualizar el precio unitario (unitPrize) en el formulario
    const unitPrice = selectedConcept?.unit_price;
    const unitPriceFormatted = this.currencyPipe.transform(unitPrice, 'MXN', 'symbol') ?? '';
    this.paymentFormGroup.get(['concepts', formIndex, 'unitPrize'])?.patchValue(unitPriceFormatted);
    
    // Calcular el subtotal basado en el precio unitario y la cantidad
    const quantity = this.paymentFormGroup.get(['concepts', formIndex, 'quantity'])?.value || 0;
    const subtotal = selectedConcept?.unit_price ? selectedConcept?.unit_price : 0 * quantity;
    const subtotalFormatted = this.currencyPipe.transform(subtotal, 'MXN', 'symbol') ?? '';
    
    // Actualizar el valor del subtotal en el formulario
    this.paymentFormGroup.get(['concepts', formIndex, 'subtotal'])?.patchValue(subtotalFormatted);
    
    //calculamos el total para el resumen del pago
    this.calculateTotal()
    
    //calculamos el adeudo
    this.calculateDebt(0)
  }

  //used to calculate subtotal by row
  calculateSubtotal(formIndex: number) {
    const conceptFormGroup = this.concepts.at(formIndex);

    const formattedUnitPrice = conceptFormGroup.get('unitPrize')?.value
    const unitPrice = parseFloat(formattedUnitPrice.replace(/[^0-9.-]+/g, ""))

    const formattedQuantity = conceptFormGroup.get('quantity')?.value || 0;
    const quantity = parseFloat(formattedQuantity.replace(/[^0-9.-]+/g, ""))
    
    const subtotal = unitPrice * quantity;
  
    const formattedSubtotal = this.currencyPipe.transform(subtotal, 'MXN', 'symbol') ?? '';
    conceptFormGroup.get('subtotal')?.patchValue(formattedSubtotal);
    this.calculateTotal()
    const currentIncome = this.paymentFormGroup.get('income')?.value
    const numericIncome = parseFloat(currentIncome.replace(/[^0-9.-]+/g, ""));
    this.calculateDebt(numericIncome)
  }

  //used to calculate total by row
  calculateTotal(){
    let total = 0;
    // Iterar sobre los controles del FormArray
    this.concepts.controls.forEach((control: AbstractControl<any>, index: number) => {
      if (control instanceof FormGroup) {

        const formattedSubtotal = control.get('subtotal')?.value
        const subtotal = parseFloat(formattedSubtotal.replace(/[^0-9.-]+/g, ""))

        total += subtotal;
      }
    });
    const formattedTotal = this.currencyPipe.transform(total, 'MXN', 'symbol') ?? '';
    this.paymentFormGroup.get('total')?.patchValue(formattedTotal)
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

   //este metodo se ejecuta al enfocar el input de unit_price
  //con el objetivo de pasarlo del formato de moneda a un valor numerico
  onIncomeFocus(event: Event): void {
    //Obtiene el valor actual del input (lo que escribió el usuario).
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    // Eliminar cualquier carácter no numérico (excepto el punto y el signo negativo)
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));

    // Actualiza el valor en el formulario
    this.paymentFormGroup.controls['income'].setValue(numericValue);
  }

   //este metodo se ejecuta al desenfocar el input de unit_price
  //con el objetivo de pasar el valor numerico a un formato de moneda
  onIncomeBlur(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    // Eliminar cualquier carácter no numérico (excepto el punto y el signo negativo)
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    
    this.calculateDebt(numericValue)
    
    // Formatea el valor numérico a moneda
    const incomeFormatted = this.currencyPipe.transform(numericValue, 'MXN', 'symbol') ?? '';

    // Actualiza el valor en el formulario con el formato de mon
    this.paymentFormGroup.controls['income'].setValue(incomeFormatted);
  }

  //display payment grand debt
  calculateDebt(income: number | null | undefined ){
    let debt = 0  
    const formattedTotal = this.paymentFormGroup.get('total')?.value
    const total = parseFloat(formattedTotal.replace(/[^0-9.-]+/g, ""))
    
    if((total !== null && total !== undefined) && (income !== null && income !== undefined) ){
      debt = total - income 
    }

    const formattedDebt = this.currencyPipe.transform(debt, 'MXN', 'symbol') ?? '';

    this.paymentFormGroup.get('debt')?.patchValue(formattedDebt)
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

  private removeCurrencyFormatFromFields(formGroup: FormGroup, fieldsToFormat: string[]) {
    const cleanValue = (value: any, fieldName: string) => {
      if (fieldsToFormat.includes(fieldName) && typeof value === 'string') {
        return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
      }
      return value;
    };
  
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
  
      if (control instanceof FormGroup) {
        this.removeCurrencyFormatFromFields(control, fieldsToFormat);
      } else if (control instanceof FormArray) {
        control.controls.forEach((group) => this.removeCurrencyFormatFromFields(group as FormGroup, fieldsToFormat));
      } else {
        control?.setValue(cleanValue(control.value, key), { emitEvent: false });
      }
    });
  }
  
}
