import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserConcept } from '../models/user-concept.model';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse } from '../../core/models/api-response.model';

const API_PATH = environment.API_URL;

@Injectable({
    providedIn: 'root'
})
// Service to manage concepts created by users
export class UserConceptsService {
    constructor(private api: ApiService) { }

    listUserConcepts(page = 1, limit = 10) {
        return this.api.get<PaginatedResponse<UserConcept>>(
            `${API_PATH}/user-concepts?page=${page}&limit=${limit}`
        );
    }
    createUserConcept(concept: UserConcept) {
        return this.api.post<UserConcept>(`${API_PATH}/user-concepts`, concept);
    }

    updateUserConcept(id: number, concept: UserConcept) {
        return this.api.put<UserConcept>(`${API_PATH}/user-concepts/${id}`, concept);
    }

    deleteUserConcept(id: number) {
        return this.api.delete<null>(`${API_PATH}/user-concepts/${id}`);
    }

    getUserConcept(id: number) {
        return this.api.get<UserConcept>(`${API_PATH}/user-concepts/${id}`);
    }
}
