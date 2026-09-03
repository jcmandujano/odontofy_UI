import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import {
    CreateEvolutionNoteRequest,
    EvolutionNote,
    EvolutionNoteFilters,
    UpdateEvolutionNoteRequest
} from '../models/evolution-note.model';
import { mapApiResponse, mapPaginatedApiResponse } from '../models/api-response.model';
import { ApiService } from './api.service';

interface ApiEvolutionNote {
    id: number;
    patientId: number;
    treatmentPlanId: number | null;
    treatmentPlanItemId: number | null;
    note: string;
    occurredAt: string;
    createdAt: string;
    updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class EvolutionNoteService {
    constructor(private api: ApiService) { }

    createNote(patientId: number, note: CreateEvolutionNoteRequest) {
        return this.api.post<ApiEvolutionNote>(`/patients/${patientId}/evolution-notes`, noteRequest(note)).pipe(
            map(response => mapApiResponse(response, toUiNote))
        );
    }

    listNotes(patientId: number, page = 1, limit = 10, search = '', filters: EvolutionNoteFilters = {}) {
        return this.api.get<ApiEvolutionNote[]>(`/patients/${patientId}/evolution-notes`, {
            params: {
                page,
                pageSize: limit,
                ...(search.trim() && { search: search.trim() }),
                ...(filters.treatment_plan_id && { treatmentPlanId: filters.treatment_plan_id }),
                ...(filters.treatment_plan_item_id && { treatmentPlanItemId: filters.treatment_plan_item_id })
            }
        }).pipe(map(response => mapPaginatedApiResponse(response, toUiNote)));
    }

    findNoteByCriteria(patientId: number, criteria: string) {
        return this.api.get<ApiEvolutionNote[]>(`/patients/${patientId}/evolution-notes`, {
            params: { search: criteria, pageSize: 100 }
        }).pipe(map(response => mapApiResponse(response, values => values.map(toUiNote))));
    }

    updateNote(patientId: number, noteId: number, note: UpdateEvolutionNoteRequest) {
        return this.api.patch<ApiEvolutionNote>(`/patients/${patientId}/evolution-notes/${noteId}`, {
            ...noteRequest(note),
            changeReason: 'Corrección solicitada desde el expediente clínico'
        }).pipe(map(response => mapApiResponse(response, toUiNote)));
    }

    deleteNote(patientId: number, noteId: number) {
        return this.api.delete<ApiEvolutionNote>(`/patients/${patientId}/evolution-notes/${noteId}`, {
            body: { changeReason: 'Archivado solicitado desde el expediente clínico' }
        }).pipe(map(response => mapApiResponse(response, toUiNote)));
    }
}

const noteRequest = (value: CreateEvolutionNoteRequest | UpdateEvolutionNoteRequest) => ({
    ...(value.note !== undefined && { note: value.note }),
    ...(value.treatment_plan_id !== undefined && { treatmentPlanId: value.treatment_plan_id }),
    ...(value.treatment_plan_item_id !== undefined && { treatmentPlanItemId: value.treatment_plan_item_id })
});

const toUiNote = (value: ApiEvolutionNote): EvolutionNote => Object.assign(new EvolutionNote(), {
    id: value.id,
    patient_id: value.patientId,
    treatment_plan_id: value.treatmentPlanId,
    treatment_plan_item_id: value.treatmentPlanItemId,
    note: value.note,
    createdAt: value.occurredAt ?? value.createdAt,
    updatedAt: value.updatedAt
});
