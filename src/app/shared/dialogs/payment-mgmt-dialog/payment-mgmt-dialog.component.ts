import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Inject, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Payment } from '../../../core/models/payment.model';
import { PaymentConcept } from '../../../core/models/payment-concept.model';
import { Patient } from '../../../core/models/patient.model';
import { UserConcept } from '../../../core/models/user-concept.model';
import { CurrencyInputDirective } from '../../directives/currency-input.directive';

interface ConceptRow {
  id: number;
}

export interface PaymentDialogResult {
  paymentDate: string;
  subtotal: number;
  discount: number;
  total: number;
  income: number;
  debt: number;
  concepts: Array<{
    id?: number;
    paymentConcept: number;
    paymentMethod: string;
    quantity: number;
  }>;
}

const PAYMENT_METHOD_LIST = [
  { id: 'CASH', description: 'Efectivo' },
  { id: 'CREDIT', description: 'Tarjeta de Credito' },
  { id: 'DEBIT', description: 'Tarjeta de Debito' },
  { id: 'TRANSFERENCE', description: 'Transferencia electronica' },
];

@Component({
  selector: 'app-payment-mgmt-dialog',
  imports: [
    CommonModule,
    CurrencyInputDirective,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './payment-mgmt-dialog.component.html',
  styleUrl: './payment-mgmt-dialog.component.scss',
})
export class PaymentMgmtDialogComponent {
  @ViewChild(MatTable) table!: MatTable<ConceptRow>;

  readonly displayedColumns = [
    'concept',
    'unitPrice',
    'paymentMethod',
    'quantity',
    'subtotal',
    'actions',
  ];
  readonly paymentMethodList = PAYMENT_METHOD_LIST;

  paymentFormGroup: FormGroup;
  conceptData: ConceptRow[] = [];
  filteredConceptsByRow: UserConcept[][] = [];
  conceptList: UserConcept[];
  selectedPatient: Patient;
  paymentData?: Payment;

  private nextRowId = 1;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public dialogData: {
      patientData: Patient;
      conceptsData: UserConcept[];
      paymentData?: Payment;
    },
    public dialogRef: MatDialogRef<PaymentMgmtDialogComponent>,
    private readonly fb: FormBuilder,
    private readonly destroyRef: DestroyRef
  ) {
    this.selectedPatient = dialogData.patientData;
    this.conceptList = dialogData.conceptsData;
    this.paymentData = dialogData.paymentData;
    this.paymentFormGroup = this.fb.group({
      paymentDate: [this.getCurrentDate(), Validators.required],
      subtotal: [0, [Validators.required, Validators.min(0)]],
      applyDiscount: [false],
      discount: [{ value: 0, disabled: true }, [Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0)]],
      income: [0, [Validators.required, Validators.min(0)]],
      debt: [0, Validators.required],
      concepts: this.fb.array([]),
    });

    this.paymentFormGroup
      .get('income')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalculateSummary());
    this.paymentFormGroup
      .get('discount')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalculateSummary());
  }

  ngOnInit(): void {
    if (this.paymentData) {
      this.patchValuesToEdit(this.paymentData);
      return;
    }

    this.initializeRows();
  }

  get concepts(): FormArray {
    return this.paymentFormGroup.get('concepts') as FormArray;
  }

  get dialogTitle(): string {
    return this.paymentData ? 'Editar pago' : 'Nuevo pago';
  }

  displayConcept = (value: number | string | null): string => {
    if (typeof value !== 'number') return value ?? '';
    return this.conceptList.find((concept) => concept.id === value)?.description ?? '';
  };

  addItem(): void {
    this.addConceptRow();
  }

  removeItem(index: number): void {
    this.concepts.removeAt(index);
    this.conceptData.splice(index, 1);
    this.filteredConceptsByRow.splice(index, 1);
    this.table.renderRows();
    this.recalculateSummary();
  }

  filterConcepts(formIndex: number, searchTerm: string): void {
    const normalizedSearch = this.normalizeText(searchTerm);
    this.filteredConceptsByRow[formIndex] = this.conceptList.filter((concept) =>
      this.normalizeText(concept.description).includes(normalizedSearch)
    );

    const conceptGroup = this.concepts.at(formIndex) as FormGroup;
    conceptGroup.patchValue({ unitPrice: 0, subtotal: 0 }, { emitEvent: false });
    this.recalculateSummary();
  }

  showConceptOptions(formIndex: number): void {
    const value = this.concepts.at(formIndex).get('paymentConcept')?.value;
    this.filteredConceptsByRow[formIndex] =
      typeof value === 'string'
        ? this.conceptList.filter((concept) =>
            this.normalizeText(concept.description).includes(this.normalizeText(value))
          )
        : [...this.conceptList];
  }

  selectConcept(event: MatAutocompleteSelectedEvent, formIndex: number): void {
    const conceptId = Number(event.option.value);
    const selectedConcept = this.conceptList.find((concept) => concept.id === conceptId);
    if (!selectedConcept) return;

    const conceptGroup = this.concepts.at(formIndex) as FormGroup;
    conceptGroup.get('paymentConcept')?.setValue(selectedConcept.id, { emitEvent: false });
    conceptGroup.get('unitPrice')?.setValue(Number(selectedConcept.unit_price), { emitEvent: false });
    this.recalculateRow(conceptGroup);
  }

  toggleDiscount(enabled: boolean): void {
    const discountControl = this.paymentFormGroup.get('discount');

    if (enabled) {
      discountControl?.enable({ emitEvent: false });
    } else {
      discountControl?.setValue(0, { emitEvent: false });
      discountControl?.disable({ emitEvent: false });
    }

    this.recalculateSummary();
  }

  savePayment(): void {
    this.recalculateSummary();
    if (this.paymentFormGroup.invalid) {
      this.markFormGroupTouched(this.paymentFormGroup);
      return;
    }

    const value = this.paymentFormGroup.getRawValue();
    const result: PaymentDialogResult = {
      paymentDate: value.paymentDate,
      subtotal: Number(value.subtotal),
      discount: Number(value.discount),
      total: Number(value.total),
      income: Number(value.income),
      debt: Number(value.debt),
      concepts: value.concepts.map((concept: Record<string, unknown>) => ({
        ...(concept['id'] ? { id: Number(concept['id']) } : {}),
        paymentConcept: Number(concept['paymentConcept']),
        paymentMethod: String(concept['paymentMethod']),
        quantity: Number(concept['quantity']),
      })),
    };

    this.dialogRef.close(result);
  }

  getDisplayPaymentDate(): string {
    const paymentDate = String(this.paymentFormGroup.get('paymentDate')?.value ?? '');
    const [year, month, day] = paymentDate.slice(0, 10).split('-');
    return year && month && day ? `${day}-${month}-${year}` : paymentDate;
  }

  getPatientFullName(): string {
    return [
      this.selectedPatient.name,
      this.selectedPatient.middle_name,
      this.selectedPatient.last_name,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private initializeRows(): void {
    this.concepts.clear();
    this.conceptData = [];
    this.filteredConceptsByRow = [];
    this.addConceptRow();
  }

  private patchValuesToEdit(payment: Payment): void {
    this.concepts.clear();
    this.conceptData = [];
    this.filteredConceptsByRow = [];
    const discount = Number(payment.discount ?? 0);
    this.toggleDiscount(discount > 0);
    this.paymentFormGroup.patchValue(
      {
        paymentDate: String(payment.payment_date).slice(0, 10),
        income: Number(payment.income ?? 0),
        applyDiscount: discount > 0,
        discount,
      },
      { emitEvent: false }
    );

    payment.concepts.forEach((concept) => this.addConceptRow(concept));
    if (payment.concepts.length === 0) this.addConceptRow();
    this.recalculateSummary();
  }

  private addConceptRow(paymentConcept?: PaymentConcept): void {
    const selectedConcept = paymentConcept
      ? this.conceptList.find((concept) => concept.id === paymentConcept.conceptId)
      : undefined;
    const unitPrice = Number(selectedConcept?.unit_price ?? 0);
    const quantity = Number(paymentConcept?.quantity ?? 1);
    const conceptGroup = this.fb.group({
      id: [paymentConcept?.id ?? null],
      paymentConcept: [paymentConcept?.conceptId ?? null, [Validators.required, this.validateConcept]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
      paymentMethod: [paymentConcept?.paymentMethod ?? '', Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      subtotal: [this.roundMoney(unitPrice * quantity), [Validators.required, Validators.min(0)]],
    });

    conceptGroup
      .get('quantity')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalculateRow(conceptGroup));

    this.concepts.push(conceptGroup);
    this.conceptData.push({ id: this.nextRowId++ });
    this.filteredConceptsByRow.push([...this.conceptList]);
    this.table?.renderRows();
    this.recalculateSummary();
  }

  private recalculateRow(conceptGroup: FormGroup): void {
    const unitPrice = Number(conceptGroup.get('unitPrice')?.value ?? 0);
    const quantity = Number(conceptGroup.get('quantity')?.value ?? 0);
    const subtotal = this.roundMoney(unitPrice * (Number.isFinite(quantity) ? quantity : 0));
    conceptGroup.get('subtotal')?.setValue(subtotal, { emitEvent: false });
    this.recalculateSummary();
  }

  private recalculateSummary(): void {
    const subtotal = this.roundMoney(
      this.concepts.controls.reduce(
        (sum, control) => sum + Number(control.get('subtotal')?.value ?? 0),
        0
      )
    );
    const applyDiscount = Boolean(this.paymentFormGroup.get('applyDiscount')?.value);
    const requestedDiscount = applyDiscount
      ? Number(this.paymentFormGroup.get('discount')?.value ?? 0)
      : 0;
    const discount = this.roundMoney(
      Math.min(Math.max(Number.isFinite(requestedDiscount) ? requestedDiscount : 0, 0), subtotal)
    );
    const total = this.roundMoney(subtotal - discount);
    const incomeValue = Number(this.paymentFormGroup.get('income')?.value ?? 0);
    const income = Number.isFinite(incomeValue) ? incomeValue : 0;
    const debt = this.roundMoney(total - income);

    this.paymentFormGroup.patchValue({ subtotal, total, debt }, { emitEvent: false });
    if (requestedDiscount > subtotal) {
      this.paymentFormGroup.get('discount')?.setValue(discount, { emitEvent: false });
    }
  }

  private validateConcept = (control: AbstractControl): ValidationErrors | null => {
    const conceptId = control.value;
    return typeof conceptId === 'number' && this.conceptList.some(({ id }) => id === conceptId)
      ? null
      : { invalidConcept: true };
  };

  private normalizeText(value: string): string {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es-MX')
      .trim();
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private getCurrentDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormArray) {
        control.controls.forEach((group) => this.markFormGroupTouched(group as FormGroup));
        return;
      }

      control.markAsTouched();
    });
  }
}
