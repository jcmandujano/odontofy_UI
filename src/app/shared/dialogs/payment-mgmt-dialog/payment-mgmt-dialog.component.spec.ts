import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Patient } from '../../../core/models/patient.model';
import { UserConcept } from '../../../core/models/user-concept.model';
import {
  PaymentDialogResult,
  PaymentMgmtDialogComponent,
} from './payment-mgmt-dialog.component';

describe('PaymentMgmtDialogComponent', () => {
  let component: PaymentMgmtDialogComponent;
  let fixture: ComponentFixture<PaymentMgmtDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<PaymentMgmtDialogComponent>>;

  const concepts = [
    Object.assign(new UserConcept(), {
      id: 1,
      description: 'Limpieza dental',
      unit_price: 500,
    }),
    Object.assign(new UserConcept(), {
      id: 2,
      description: 'Consulta inicial',
      unit_price: 300,
    }),
  ];

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<PaymentMgmtDialogComponent>>('MatDialogRef', [
      'close',
    ]);

    await TestBed.configureTestingModule({
      imports: [PaymentMgmtDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            patientData: Object.assign(new Patient(), {
              id: 10,
              name: 'Ana',
              last_name: 'Lopez',
            }),
            conceptsData: concepts,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentMgmtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('filters concepts by the entered text', () => {
    component.filterConcepts(0, 'limp');

    expect(component.filteredConceptsByRow[0].map(({ id }) => id)).toEqual([1]);
  });

  it('calculates the global discount and sends numeric values', () => {
    const conceptGroup = component.concepts.at(0);
    conceptGroup.patchValue({ paymentMethod: 'CASH', quantity: 2 });
    component.selectConcept(
      { option: { value: 1 } } as unknown as MatAutocompleteSelectedEvent,
      0
    );
    component.paymentFormGroup.get('applyDiscount')?.setValue(true);
    component.toggleDiscount(true);
    component.paymentFormGroup.patchValue({ discount: 100, income: 300 });

    expect(component.paymentFormGroup.get('subtotal')?.value).toBe(1000);
    expect(component.paymentFormGroup.get('total')?.value).toBe(900);
    expect(component.paymentFormGroup.get('debt')?.value).toBe(600);

    component.savePayment();
    const result = dialogRef.close.calls.mostRecent().args[0] as PaymentDialogResult;
    expect(result.discount).toBe(100);
    expect(result.concepts[0]).toEqual(
      jasmine.objectContaining({ paymentConcept: 1, paymentMethod: 'CASH', quantity: 2 })
    );
  });
});
