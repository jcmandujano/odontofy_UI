import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { mapPaginatedApiResponse } from '../models/api-response.model';
import { ApiService } from './api.service';

export interface TreatmentChargeRow {
  treatmentId: number; treatmentPlanId: number | null; name: string; clinicalStatus: string;
  catalogLinked: boolean; chargeId: number | null; subtotal: string; discount: string; total: string;
  paid: string; balance: string; financialStatus: 'UNCONFIRMED' | 'UNPAID' | 'PARTIAL' | 'PAID';
}
@Injectable({ providedIn: 'root' })
export class TreatmentChargeService {
  constructor(private api: ApiService) {}
  list(patientId: number, page = 1, pageSize = 10, scope = 'all', treatmentPlanId?: number) {
    return this.api.get<TreatmentChargeRow[]>(`/patients/${patientId}/treatment-charges`, {
      params: { page, pageSize, scope, ...(treatmentPlanId !== undefined && { treatmentPlanId }) }
    }).pipe(map(response => mapPaginatedApiResponse(response, row => row)));
  }
  confirm(patientId: number, treatmentId: number, occurredOn: string, discount: string, expectedTotal: string) {
    return this.api.post(`/patients/${patientId}/treatment-charges/${treatmentId}/confirmation`, { occurredOn, discount, expectedTotal });
  }
  pay(patientId: number, occurredOn: string, paymentMethod: string, allocations: Array<{ chargeId: number; amount: string }>, key: string) {
    return this.api.post(`/patients/${patientId}/treatment-payments`, { occurredOn, paymentMethod, allocations }, { headers: { 'Idempotency-Key': key } });
  }
}
