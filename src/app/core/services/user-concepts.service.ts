import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { mapApiResponse, mapPaginatedApiResponse } from '../models/api-response.model';
import { UserConcept } from '../models/user-concept.model';
import { ApiService } from './api.service';

interface ApiBillingConcept {
    id: number;
    description: string;
    unitPrice: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserConceptsService {
    constructor(private api: ApiService) { }

    listUserConcepts(page = 1, limit = 10) {
        return this.api.get<ApiBillingConcept[]>('/billing-concepts', {
            params: { page: Math.max(1, page), pageSize: limit }
        }).pipe(map(response => mapPaginatedApiResponse(response, toUiConcept)));
    }

    createUserConcept(concept: UserConcept) {
        return this.api.post<ApiBillingConcept>('/billing-concepts', conceptRequest(concept)).pipe(
            map(response => mapApiResponse(response, toUiConcept))
        );
    }

    updateUserConcept(id: number, concept: UserConcept) {
        return this.api.patch<ApiBillingConcept>(`/billing-concepts/${id}`, conceptRequest(concept)).pipe(
            map(response => mapApiResponse(response, toUiConcept))
        );
    }

    deleteUserConcept(id: number) {
        return this.api.delete<ApiBillingConcept>(`/billing-concepts/${id}`).pipe(
            map(response => mapApiResponse(response, toUiConcept))
        );
    }

    getUserConcept(id: number) {
        return this.api.get<ApiBillingConcept>(`/billing-concepts/${id}`).pipe(
            map(response => mapApiResponse(response, toUiConcept))
        );
    }
}

const conceptRequest = (value: UserConcept) => ({
    description: value.description,
    unitPrice: Number(value.unit_price ?? 0).toFixed(2)
});

const toUiConcept = (value: ApiBillingConcept): UserConcept => Object.assign(new UserConcept(), {
    id: value.id,
    description: value.description,
    unit_price: Number(value.unitPrice),
    is_custom: true,
    createdAt: new Date(value.createdAt),
    updatedAt: new Date(value.updatedAt)
});
