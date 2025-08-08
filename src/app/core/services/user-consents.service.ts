import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserInformedConsent } from '../models/user-consent.model';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse } from '../../core/models/api-response.model';

const API_PATH = environment.API_URL;

@Injectable({
    providedIn: 'root'
})
/** Service to manage informed consents created by users */
export class UserConsentService {
    constructor(private api: ApiService) { }

    listUserConsent(page = 1, limit = 10) {
        return this.api.get<PaginatedResponse<UserInformedConsent>>(
            `${API_PATH}/user-informed-consents?page=${page}&limit=${limit}`
        );
    }

    createUserConsent(concept: UserInformedConsent) {
        return this.api.post<UserInformedConsent>(`${API_PATH}/user-informed-consents`, concept);
    }

    updateUserConsent(id: number, concept: UserInformedConsent) {
        return this.api.put<UserInformedConsent>(`${API_PATH}/user-informed-consents/${id}`, concept);
    }

    deleteUserConsent(id: number) {
        return this.api.delete<null>(`${API_PATH}/user-informed-consents/${id}`);
    }

    getUserConsent(id: number) {
        return this.api.get<UserInformedConsent>(`${API_PATH}/user-informed-consents/${id}`);
    }
}
