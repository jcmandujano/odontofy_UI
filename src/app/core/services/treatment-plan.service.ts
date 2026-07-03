import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import {
    CreateTreatmentPlanItemRequest,
    CreateTreatmentPlanRequest,
    DeleteTreatmentPlanItemResponse,
    TreatmentPlan,
    TreatmentPlanDetailResponse,
    TreatmentPlanItem,
    TreatmentPlanItemMutationResponse,
    TreatmentPlanListResponse,
    UpdateTreatmentPlanItemRequest,
    UpdateTreatmentPlanItemStatusRequest,
    UpdateTreatmentPlanRequest,
    UpdateTreatmentPlanStatusRequest,
} from '../models/treatment-plan.model';

const API_PATH = environment.API_URL;

@Injectable({
    providedIn: 'root'
})
export class TreatmentPlanService {
    constructor(private api: ApiService) { }

    listTreatmentPlansByPatient(patientId: number) {
        return this.api.get<TreatmentPlanListResponse>(`${API_PATH}/patients/${patientId}/treatment-plans`);
    }

    createTreatmentPlan(patientId: number, treatmentPlan: CreateTreatmentPlanRequest) {
        return this.api.post<TreatmentPlan>(`${API_PATH}/patients/${patientId}/treatment-plans`, treatmentPlan);
    }

    getTreatmentPlanDetail(id: number) {
        return this.api.get<TreatmentPlanDetailResponse>(`${API_PATH}/treatment-plans/${id}`);
    }

    updateTreatmentPlan(id: number, treatmentPlan: UpdateTreatmentPlanRequest) {
        return this.api.put<TreatmentPlan>(`${API_PATH}/treatment-plans/${id}`, treatmentPlan);
    }

    cancelTreatmentPlan(id: number) {
        return this.api.delete<TreatmentPlan>(`${API_PATH}/treatment-plans/${id}`);
    }

    updateTreatmentPlanStatus(id: number, status: UpdateTreatmentPlanStatusRequest) {
        return this.api.patch<TreatmentPlan>(`${API_PATH}/treatment-plans/${id}/status`, status);
    }

    createTreatmentPlanItem(id: number, item: CreateTreatmentPlanItemRequest) {
        return this.api.post<TreatmentPlanItemMutationResponse>(`${API_PATH}/treatment-plans/${id}/items`, item);
    }

    updateTreatmentPlanItem(id: number, itemId: number, item: UpdateTreatmentPlanItemRequest) {
        return this.api.put<TreatmentPlanItemMutationResponse>(`${API_PATH}/treatment-plans/${id}/items/${itemId}`, item);
    }

    deleteTreatmentPlanItem(id: number, itemId: number) {
        return this.api.delete<DeleteTreatmentPlanItemResponse>(`${API_PATH}/treatment-plans/${id}/items/${itemId}`);
    }

    updateTreatmentPlanItemStatus(id: number, itemId: number, status: UpdateTreatmentPlanItemStatusRequest) {
        return this.api.patch<TreatmentPlanItem>(`${API_PATH}/treatment-plans/${id}/items/${itemId}/status`, status);
    }
}
