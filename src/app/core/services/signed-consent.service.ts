import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { mapApiResponse, mapPaginatedApiResponse } from '../models/api-response.model';
import { SignedConsent } from '../models/signed-consent.model';
import { ApiService } from './api.service';
import { FileService } from './file.service';

export interface SignedConsentInput {
    templateId: number;
    signatoryName: string;
    file?: File;
}

interface ApiSignedConsent {
    id: number;
    patientId: number;
    template: { id: number; name: string; fileId: string | null };
    signedDocumentFileId: string | null;
    status: string;
    signedAt: string;
    doctorName: string;
    signatory: { name: string; capacity: 'PATIENT' | 'REPRESENTATIVE' };
    createdAt: string;
    updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class SignedConsentService {
    constructor(private api: ApiService, private files: FileService) { }

    listSignedConsents(patientId: number | string | null, page = 1, limit = 10) {
        return this.api.get<ApiSignedConsent[]>(`/patients/${patientId}/signed-consents`, {
            params: { page: Math.max(1, page), pageSize: limit, status: 'all' }
        }).pipe(map(response => {
            const active = { ...response, data: (response.data ?? []).filter(item => item.status !== 'VOIDED') };
            return mapPaginatedApiResponse(active, toUiSignedConsent);
        }));
    }

    getSignedConsent(patientId: number | string, id: number) {
        return this.api.get<ApiSignedConsent>(`/patients/${patientId}/signed-consents/${id}`).pipe(
            map(response => mapApiResponse(response, toUiSignedConsent))
        );
    }

    createSignedConsent(patientId: number | string | null, input: SignedConsentInput) {
        return this.upload(input.file).pipe(switchMap(signedDocumentFileId =>
            this.api.post<ApiSignedConsent>(`/patients/${patientId}/signed-consents`, {
                templateId: Number(input.templateId),
                signedAt: new Date().toISOString(),
                signedDocumentFileId,
                signatoryName: input.signatoryName,
                signatoryCapacity: 'PATIENT'
            })
        ), map(response => mapApiResponse(response, toUiSignedConsent)));
    }

    deleteSignedConsent(patientId: number | string | null, id: number) {
        return this.api.post<ApiSignedConsent>(`/patients/${patientId}/signed-consents/${id}/void`, {
            reason: 'Anulado desde la pantalla de consentimientos'
        }).pipe(map(response => mapApiResponse(response, toUiSignedConsent)));
    }

    private upload(file?: File): Observable<string | null> {
        if (!file) return of(null);
        return this.files.upload(file, 'SIGNED_CONSENT').pipe(map(response => response.data?.id ?? null));
    }
}

const toUiSignedConsent = (value: ApiSignedConsent): SignedConsent => new SignedConsent({
    id: value.id,
    consent_id: value.template.id,
    consent_name: value.template.name,
    patient_id: value.patientId,
    doctor_id: 0,
    signed_date: value.signedAt,
    file_url: value.signedDocumentFileId,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    consent: { id: value.template.id, name: value.template.name }
});
