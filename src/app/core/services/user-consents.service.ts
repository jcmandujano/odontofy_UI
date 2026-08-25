import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { mapApiResponse, mapPaginatedApiResponse } from '../models/api-response.model';
import { UserInformedConsent } from '../models/user-consent.model';
import { ApiService } from './api.service';
import { FileService } from './file.service';

export interface ConsentTemplateInput extends Partial<UserInformedConsent> {
  file?: File;
}

interface ApiConsentTemplate {
  id: number;
  catalogId: number | null;
  name: string;
  description: string | null;
  source: 'CUSTOM' | 'CATALOG';
  templateFileId: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserConsentService {
    constructor(private api: ApiService, private files: FileService) { }

    listUserConsent(page = 1, limit = 10) {
        return this.api.get<ApiConsentTemplate[]>('/consent-templates', {
            params: { page: Math.max(1, page), pageSize: limit }
        }).pipe(map(response => mapPaginatedApiResponse(response, toUiTemplate)));
    }

    createUserConsent(input: ConsentTemplateInput) {
        return this.upload(input.file).pipe(switchMap(templateFileId =>
            this.api.post<ApiConsentTemplate>('/consent-templates', templateRequest(input, templateFileId))
        ), map(response => mapApiResponse(response, toUiTemplate)));
    }

    updateUserConsent(id: number, input: ConsentTemplateInput) {
        return this.upload(input.file).pipe(switchMap(templateFileId =>
            this.api.patch<ApiConsentTemplate>(`/consent-templates/${id}`, templateRequest(input, templateFileId, !!input.file))
        ), map(response => mapApiResponse(response, toUiTemplate)));
    }

    deleteUserConsent(id: number) {
        return this.api.delete<ApiConsentTemplate>(`/consent-templates/${id}`).pipe(
            map(response => mapApiResponse(response, toUiTemplate))
        );
    }

    getUserConsent(id: number) {
        return this.api.get<ApiConsentTemplate>(`/consent-templates/${id}`).pipe(
            map(response => mapApiResponse(response, toUiTemplate))
        );
    }

    private upload(file?: File): Observable<string | null> {
        if (!file) return of(null);
        return this.files.upload(file, 'CONSENT_TEMPLATE').pipe(map(response => response.data?.id ?? null));
    }
}

const templateRequest = (input: ConsentTemplateInput, fileId: string | null, includeFile = true) => ({
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description || null }),
    ...(includeFile && { templateFileId: fileId })
});

const toUiTemplate = (value: ApiConsentTemplate): UserInformedConsent => Object.assign(new UserInformedConsent(), {
    id: value.id,
    indormed_consent_id: value.catalogId ?? 0,
    name: value.name,
    description: value.description ?? '',
    file_url: value.templateFileId,
    createdAt: new Date(value.createdAt),
    updatedAt: new Date(value.updatedAt)
});
