import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EvolutionNote } from '../models/evolution-note.model';
import { ApiService } from '../../core/services/api.service'; // Igual que en AppointmentService
import { PaginatedResponse } from '../models/api-response.model';

const API_PATH = environment.API_URL;

@Injectable({
    providedIn: 'root'
})
export class EvolutionNoteService {
    constructor(private api: ApiService) { }

    createNote(patientId: any, note: EvolutionNote) {
        return this.api.post(`${API_PATH}/patients/${patientId}/notes`, note);
    }

    listNotes(patientId: any, page = 1, limit = 10, search: string = '') {
        let url =  `${API_PATH}/patients/${patientId}/notes?page=${page}&limit=${limit}`
        
        if (search.trim()) {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }
        return this.api.get<PaginatedResponse<EvolutionNote>>(url);
    }

    findNoteByCriteria(patientId: any, criteria: string) {
        return this.api.get<EvolutionNote[]>(`${API_PATH}/nota-de-evolucions?paciente=${patientId}&criterio=${criteria}`);
    }

    updateNote(patientId: any, noteId: number, note: EvolutionNote) {
        return this.api.put<EvolutionNote>(`${API_PATH}/patients/${patientId}/notes/${noteId}`, note);
    }

    deleteNote(patientId: any, noteId: number) {
        return this.api.delete<null>(`${API_PATH}/patients/${patientId}/notes/${noteId}`);
    }
}
