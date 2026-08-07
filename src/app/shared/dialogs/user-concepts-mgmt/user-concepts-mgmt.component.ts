import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CurrencyInputDirective } from '../../directives/currency-input.directive';

@Component({
  selector: 'app-user-concepts-mgmt',
  imports: [
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
    MatInputModule,
    MatDialogContent,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CurrencyInputDirective,
  ],
  templateUrl: './user-concepts-mgmt.component.html',
  styleUrl: './user-concepts-mgmt.component.scss',
})
export class UserConceptsMgmtComponent {
  userConceptForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<UserConceptsMgmtComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { description?: string; unit_price?: number }
  ) {
    this.userConceptForm = this.fb.group({
      description: [data?.description ?? '', Validators.required],
      unit_price: [data?.unit_price ?? 0, [Validators.required, Validators.min(0)]],
    });
  }

  save(): void {
    if (this.userConceptForm.invalid) {
      this.userConceptForm.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.userConceptForm.getRawValue());
  }
}
