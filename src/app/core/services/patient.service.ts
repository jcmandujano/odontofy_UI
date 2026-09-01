import { Injectable } from '@angular/core';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { ApiV1Patient } from '../models/api-v1.model';
import { toApiPatient, toUiPatient } from '../models/api-v1.mapper';
import { mapApiResponse, mapPaginatedApiResponse } from '../models/api-response.model';
import { Patient } from '../models/patient.model';
import { ApiService } from './api.service';
import { ClinicalRecordService } from './clinical-record.service';

@Injectable({ providedIn: 'root' })
export class PacientesService {
    constructor(private api: ApiService, private clinicalRecords: ClinicalRecordService) { }

    createPatient(patient: Patient) {
        return this.api.post<ApiV1Patient>('/patients', toApiPatient(patient)).pipe(
            switchMap(response => {
                if (!response.data) return of(mapApiResponse(response, toUiPatient));
                const uiPatient = toUiPatient(response.data);
                return this.clinicalRecords.updateMedicalHistory(response.data.id, patient).pipe(
                    map(history => ({ ...mapApiResponse(response, () => uiPatient), data: this.clinicalRecords.applyToPatient(uiPatient, history.data) }))
                );
            })
        );
    }

    listPatients(page = 1, limit = 10, search = '') {
        return this.api.get<ApiV1Patient[]>('/patients', {
            params: { page: Math.max(1, page), pageSize: limit, ...(search.trim() && { search: search.trim() }) }
        }).pipe(map(response => mapPaginatedApiResponse(response, toUiPatient)));
    }

    findPatient(id: number) {
        return forkJoin({
            patient: this.api.get<ApiV1Patient>(`/patients/${id}`),
            history: this.clinicalRecords.getMedicalHistory(id)
        }).pipe(map(({ patient, history }) => mapApiResponse(patient, value =>
            this.clinicalRecords.applyToPatient(toUiPatient(value), history.data)
        )));
    }

    updatePatient(id: number, patient: Patient) {
        return forkJoin({
            patient: this.api.patch<ApiV1Patient>(`/patients/${id}`, toApiPatient(patient)),
            history: this.clinicalRecords.updateMedicalHistory(id, patient)
        }).pipe(map(({ patient: response, history }) => mapApiResponse(response, value =>
            this.clinicalRecords.applyToPatient(toUiPatient(value), history.data)
        )));
    }

    deletePatient(id: number) {
        return this.api.delete<null>(`/patients/${id}`);
    }
}
