import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CurrencyPipe } from '@angular/common';


@Component({
  selector: 'app-user-concepts-mgmt',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
    MatInputModule,
    MatDialogContent,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-concepts-mgmt.component.html',
  styleUrl: './user-concepts-mgmt.component.scss',
  providers: [CurrencyPipe]
})
export class UserConceptsMgmtComponent {
  userConceptForm: FormGroup;
  unitPriceFormatted: string | undefined;

  constructor(
    private fb: FormBuilder,
    private currencyPipe: CurrencyPipe,
    private dialogRef: MatDialogRef<UserConceptsMgmtComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userConceptForm = this.fb.group({
      description: [data?.description || '', Validators.required],
      unit_price: [data?.unit_price || 0, [Validators.required, Validators.min(0)]]
    });
  
    //this.unitPriceFormatted = '';
    this.userConceptForm.markAllAsTouched();
  }

  ngOnInit(): void {
    // Al inicializar, formateamos el valor de unit_price
    const unitPrice = this.userConceptForm.get('unit_price')?.value;
    if (unitPrice) {
      this.unitPriceFormatted = this.currencyPipe.transform(unitPrice, 'MXN', 'symbol') ?? '';
      this.userConceptForm.controls['unit_price'].setValue(this.unitPriceFormatted); // Actualiza el valor en el formulario sin el formato
      console.log('unitPriceFormatted', this.unitPriceFormatted);
    }
  }

  //este metodo se ejecuta al enfocar el input de unit_price
  //con el objetivo de pasarlo del formato de moneda a un valor numerico
  onUnitPriceFocus(event: Event): void {
    //Obtiene el valor actual del input (lo que escribió el usuario).
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    // Eliminar cualquier carácter no numérico (excepto el punto y el signo negativo)
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));

    // Actualiza el valor en el formulario
    this.userConceptForm.controls['unit_price'].setValue(numericValue);
  }

  //este metodo se ejecuta al desenfocar el input de unit_price
  //con el objetivo de pasar el valor numerico a un formato de moneda
  onUnitPriceBlur(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    // Eliminar cualquier carácter no numérico (excepto el punto y el signo negativo)
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));

    // Formatea el valor numérico a moneda
    this.unitPriceFormatted = this.currencyPipe.transform(numericValue, 'MXN', 'symbol') ?? '';

    // Actualiza el valor en el formulario con el formato de mon
    this.userConceptForm.controls['unit_price'].setValue(this.unitPriceFormatted);
  }
  

  save(): void {
    if (this.userConceptForm.valid) {
      // Eliminar cualquier carácter no numérico (excepto el punto y el signo negativo)
      this.userConceptForm.controls['unit_price'].setValue(parseFloat(this.userConceptForm.controls['unit_price'].value.replace(/[^0-9.-]+/g, "")));
      console.log('userConceptForm', this.userConceptForm.value);
      this.dialogRef.close(this.userConceptForm.value);
    }
  }
}
