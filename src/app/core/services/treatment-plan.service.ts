import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { mapApiResponse, mapPaginatedApiResponse } from '../models/api-response.model';
import {
    CreateTreatmentPlanItemRequest,
    CreateTreatmentPlanRequest,
    DeleteTreatmentPlanItemResponse,
    TreatmentPlan,
    TreatmentPlanItem,
    TreatmentPlanItemMutationResponse,
    TreatmentPlanItemPriority,
    TreatmentPlanItemStatus,
    TreatmentPlanStatus,
    UpdateTreatmentPlanItemRequest,
    UpdateTreatmentPlanItemStatusRequest,
    UpdateTreatmentPlanRequest,
    UpdateTreatmentPlanStatusRequest,
} from '../models/treatment-plan.model';
import { ApiService } from './api.service';

interface ApiTreatmentPlanItem {
    id: number;
    treatmentPlanId: number;
    userConceptId: number | null;
    name: string;
    description: string | null;
    tooth: string | null;
    area: string | null;
    quantity: string;
    unitPrice: string;
    subtotal: string;
    phase: string | null;
    priority: TreatmentPlanItemPriority | null;
    status: TreatmentPlanItemStatus;
    notes: string | null;
    sortOrder: number;
    completedAt: string | null;
    createdAt?: string;
    updatedAt?: string;
}

interface ApiTreatmentPlan {
    id: number;
    patientId: number;
    title: string;
    description: string | null;
    diagnosis?: string | null;
    patientComplaint?: string | null;
    clinicalObservations?: string | null;
    prognosis?: string | null;
    status: TreatmentPlanStatus;
    estimatedStartDate: string | null;
    estimatedEndDate: string | null;
    acceptedAt?: string | null;
    rejectedAt?: string | null;
    acceptanceNotes?: string | null;
    subtotal: string;
    discount: string;
    total: string;
    createdAt?: string;
    updatedAt?: string;
    items?: ApiTreatmentPlanItem[];
}

interface ApiTreatmentPlanMutation {
    item: ApiTreatmentPlanItem;
    treatmentPlan: ApiTreatmentPlan;
}

@Injectable({ providedIn: 'root' })
export class TreatmentPlanService {
    constructor(private api: ApiService) { }

    listTreatmentPlansByPatient(patientId: number, page = 1, limit = 10) {
        return this.api.get<ApiTreatmentPlan[]>(`/patients/${patientId}/treatment-plans`, {
            params: { page, pageSize: limit }
        }).pipe(map(response => mapPaginatedApiResponse(response, toUiPlan)));
    }

    createTreatmentPlan(patientId: number, plan: CreateTreatmentPlanRequest) {
        return this.api.post<ApiTreatmentPlan>(`/patients/${patientId}/treatment-plans`, planRequest(plan)).pipe(
            map(response => mapApiResponse(response, toUiPlan))
        );
    }

    getTreatmentPlanDetail(id: number) {
        return this.api.get<ApiTreatmentPlan>(`/treatment-plans/${id}`).pipe(
            map(response => mapApiResponse(response, toUiPlan))
        );
    }

    updateTreatmentPlan(id: number, plan: UpdateTreatmentPlanRequest) {
        return this.api.patch<ApiTreatmentPlan>(`/treatment-plans/${id}`, planRequest(plan)).pipe(
            map(response => mapApiResponse(response, toUiPlan))
        );
    }

    cancelTreatmentPlan(id: number) {
        return this.api.delete<ApiTreatmentPlan>(`/treatment-plans/${id}`).pipe(
            map(response => mapApiResponse(response, toUiPlan))
        );
    }

    updateTreatmentPlanStatus(id: number, status: UpdateTreatmentPlanStatusRequest) {
        return this.api.patch<ApiTreatmentPlan>(`/treatment-plans/${id}/status`, {
            status: status.status,
            ...(status.acceptance_notes !== undefined && { acceptanceNotes: status.acceptance_notes })
        }).pipe(map(response => mapApiResponse(response, toUiPlan)));
    }

    createTreatmentPlanItem(id: number, item: CreateTreatmentPlanItemRequest) {
        return this.api.post<ApiTreatmentPlanMutation>(`/treatment-plans/${id}/items`, itemRequest(item)).pipe(
            map(response => mapApiResponse(response, toUiMutation))
        );
    }

    updateTreatmentPlanItem(id: number, itemId: number, item: UpdateTreatmentPlanItemRequest) {
        return this.api.patch<ApiTreatmentPlanMutation>(`/treatment-plans/${id}/items/${itemId}`, itemRequest(item)).pipe(
            map(response => mapApiResponse(response, toUiMutation))
        );
    }

    deleteTreatmentPlanItem(id: number, itemId: number) {
        return this.api.delete<ApiTreatmentPlanMutation>(`/treatment-plans/${id}/items/${itemId}`).pipe(
            map(response => mapApiResponse<ApiTreatmentPlanMutation, DeleteTreatmentPlanItemResponse>(response, value => ({
                treatmentPlan: toUiPlan(value.treatmentPlan)
            })))
        );
    }

    updateTreatmentPlanItemStatus(id: number, itemId: number, status: UpdateTreatmentPlanItemStatusRequest) {
        return this.api.patch<ApiTreatmentPlanMutation>(`/treatment-plans/${id}/items/${itemId}/status`, status).pipe(
            map(response => mapApiResponse(response, value => toUiItem(value.item)))
        );
    }
}

const money = (value: number | undefined) => value === undefined ? undefined : Number(value).toFixed(2);

const planRequest = (value: CreateTreatmentPlanRequest | UpdateTreatmentPlanRequest) => ({
    ...(value.title !== undefined && { title: value.title }),
    ...(value.description !== undefined && { description: value.description }),
    ...('diagnosis' in value && value.diagnosis !== undefined && { diagnosis: value.diagnosis }),
    ...('patient_complaint' in value && value.patient_complaint !== undefined && { patientComplaint: value.patient_complaint }),
    ...('clinical_observations' in value && value.clinical_observations !== undefined && { clinicalObservations: value.clinical_observations }),
    ...('prognosis' in value && value.prognosis !== undefined && { prognosis: value.prognosis }),
    ...('estimated_start_date' in value && value.estimated_start_date !== undefined && { estimatedStartDate: value.estimated_start_date }),
    ...('estimated_end_date' in value && value.estimated_end_date !== undefined && { estimatedEndDate: value.estimated_end_date }),
    ...(value.acceptance_notes !== undefined && { acceptanceNotes: value.acceptance_notes }),
    ...(value.discount !== undefined && { discount: money(value.discount) })
});

const itemRequest = (value: CreateTreatmentPlanItemRequest | UpdateTreatmentPlanItemRequest) => ({
    ...(value.user_concept_id !== undefined && { userConceptId: value.user_concept_id }),
    ...(value.name !== undefined && { name: value.name }),
    ...(value.description !== undefined && { description: value.description }),
    ...(value.tooth !== undefined && { tooth: value.tooth }),
    ...(value.area !== undefined && { area: value.area }),
    ...(value.quantity !== undefined && { quantity: money(value.quantity) }),
    ...(value.unit_price !== undefined && { unitPrice: money(value.unit_price) }),
    ...(value.phase !== undefined && { phase: value.phase }),
    ...(value.priority !== undefined && { priority: value.priority }),
    ...(value.notes !== undefined && { notes: value.notes }),
    ...(value.sort_order !== undefined && { sortOrder: value.sort_order })
});

const toUiItem = (value: ApiTreatmentPlanItem): TreatmentPlanItem => ({
    id: value.id,
    treatment_plan_id: value.treatmentPlanId,
    user_concept_id: value.userConceptId,
    name: value.name,
    description: value.description,
    tooth: value.tooth,
    area: value.area,
    quantity: value.quantity,
    unit_price: value.unitPrice,
    subtotal: value.subtotal,
    phase: value.phase,
    priority: value.priority,
    status: value.status,
    notes: value.notes,
    sort_order: value.sortOrder,
    completed_at: value.completedAt,
    created_at: value.createdAt,
    updated_at: value.updatedAt
});

const toUiPlan = (value: ApiTreatmentPlan): TreatmentPlan => ({
    id: value.id,
    user_id: 0,
    patient_id: value.patientId,
    title: value.title,
    description: value.description,
    diagnosis: value.diagnosis ?? null,
    patient_complaint: value.patientComplaint ?? null,
    clinical_observations: value.clinicalObservations ?? null,
    prognosis: value.prognosis ?? null,
    status: value.status,
    estimated_start_date: value.estimatedStartDate,
    estimated_end_date: value.estimatedEndDate,
    accepted_at: value.acceptedAt ?? null,
    rejected_at: value.rejectedAt ?? null,
    acceptance_notes: value.acceptanceNotes ?? null,
    subtotal: value.subtotal,
    discount: value.discount,
    total: value.total,
    created_at: value.createdAt,
    updated_at: value.updatedAt,
    TreatmentPlanItems: value.items?.map(toUiItem)
});

const toUiMutation = (value: ApiTreatmentPlanMutation): TreatmentPlanItemMutationResponse => ({
    item: toUiItem(value.item),
    treatmentPlan: toUiPlan(value.treatmentPlan)
});
