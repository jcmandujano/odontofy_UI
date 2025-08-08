import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SignedConsent } from '../models/signed-consent.model';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse } from '../../core/models/api-response.model';

const API_PATH = environment.API_URL;

@Injectable({
    providedIn: 'root'
})
//this service manages signed consents for patients in the application
export class SignedConsentService {
    constructor(private api: ApiService) { }

    listSignedConsents(patientId: any, page = 1, limit = 10) {
        return this.api.get<PaginatedResponse<SignedConsent>>(
            `${API_PATH}/patients/${patientId}/signed-consents?page=${page}&limit=${limit}`
        );
    }

    getSignedConsent(patientId: any, id: number) {
        return this.api.get<SignedConsent>(`${API_PATH}/patients/${patientId}/signed-consents/${id}`);
    }

    createSignedConsent(patientId: any, signedConsent: SignedConsent) {
        return this.api.post<SignedConsent>(`${API_PATH}/patients/${patientId}/signed-consents`, signedConsent);
    }

    deleteSignedConsent(patientId: any, id: number) {
        return this.api.delete<null>(`${API_PATH}/patients/${patientId}/signed-consents/${id}`);
    }
}
