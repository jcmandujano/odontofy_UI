import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TreatmentPlanItem, TreatmentPlanItemStatus } from '../../../core/models/treatment-plan.model';
import { UserConcept } from '../../../core/models/user-concept.model';
import { TreatmentPlanItemMgmtDialogComponent } from './treatment-plan-item-mgmt-dialog.component';

describe('catalog-backed treatment dialog', () => {
  const concepts = [Object.assign(new UserConcept(), { id: 4, description: 'Limpieza', unit_price: 500 })];
  let close: jasmine.Spy;
  let component: TreatmentPlanItemMgmtDialogComponent;
  beforeEach(() => {
    close = jasmine.createSpy('close');
    component = new TreatmentPlanItemMgmtDialogComponent(new FormBuilder(), { close } as unknown as MatDialogRef<TreatmentPlanItemMgmtDialogComponent>, { conceptList: concepts });
  });

  it('requires selecting the catalog instead of creating a manual treatment', () => {
    component.itemForm.patchValue({ name: 'Manual', unitPrice: 1 });
    component.saveItem();
    expect(close).not.toHaveBeenCalled();
  });

  it('fills catalog values and submits quantity without a price override', () => {
    component.itemForm.controls['userConceptId'].setValue(4);
    component.onConceptChange(4);
    component.itemForm.controls['quantity'].setValue(2);
    expect(component.getPreviewSubtotal()).toBe(1000);
    component.saveItem();
    expect(close).toHaveBeenCalledWith(jasmine.objectContaining({ user_concept_id: 4, name: 'Limpieza', quantity: 2 }));
    expect(close.calls.mostRecent().args[0].unit_price).toBeUndefined();
  });

  it('keeps the saved snapshot when editing after the catalog price changes', () => {
    const item = { user_concept_id: 4, name: 'Nombre anterior', unit_price: 300, quantity: 1, status: TreatmentPlanItemStatus.PENDING } as TreatmentPlanItem;
    component = new TreatmentPlanItemMgmtDialogComponent(new FormBuilder(), { close } as unknown as MatDialogRef<TreatmentPlanItemMgmtDialogComponent>, { mode: 'edit', conceptList: concepts, treatmentPlanItem: item });
    expect(component.getPreviewSubtotal()).toBe(300);
    component.saveItem();
    expect(close).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Nombre anterior' }));
  });

  it('allows clinical status updates for legacy treatments without a catalog', () => {
    component = new TreatmentPlanItemMgmtDialogComponent(new FormBuilder(), { close } as unknown as MatDialogRef<TreatmentPlanItemMgmtDialogComponent>, { mode: 'status', treatmentPlanItem: { user_concept_id: null, status: TreatmentPlanItemStatus.PENDING } as TreatmentPlanItem });
    component.itemForm.controls['status'].setValue(TreatmentPlanItemStatus.COMPLETED);
    component.saveItem();
    expect(close).toHaveBeenCalledWith({ status: TreatmentPlanItemStatus.COMPLETED });
  });

  it('locks quantities and catalog selection after charge confirmation while keeping notes editable', () => {
    const item = { user_concept_id: 4, name: 'Limpieza', unit_price: 500, quantity: 1, financial_locked: true, status: TreatmentPlanItemStatus.PENDING } as TreatmentPlanItem;
    component = new TreatmentPlanItemMgmtDialogComponent(new FormBuilder(), { close } as unknown as MatDialogRef<TreatmentPlanItemMgmtDialogComponent>, { mode: 'edit', conceptList: concepts, treatmentPlanItem: item });
    expect(component.itemForm.controls['quantity'].disabled).toBeTrue();
    expect(component.itemForm.controls['userConceptId'].disabled).toBeTrue();
    component.itemForm.controls['notes'].setValue('Clinical follow-up');
    component.saveItem();
    expect(close).toHaveBeenCalledWith(jasmine.objectContaining({ notes: 'Clinical follow-up', user_concept_id: 4, quantity: 1 }));
  });
});
