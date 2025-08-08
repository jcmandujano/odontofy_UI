import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.model';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse } from '../../core/models/api-response.model';

const API_PATH = environment.API_URL;

@Injectable({
    providedIn: 'root'
})
export class PacientesService {
    constructor(private api: ApiService) { }

    createPatient(paciente: Patient) {
        return this.api.post<Patient>(`${API_PATH}/patients`, paciente);
    }

    listPatients(page = 1, limit = 10) {
        return this.api.get<PaginatedResponse<Patient>>(
            `${API_PATH}/patients?page=${page}&limit=${limit}`
        );
    }

    findPatient(id: number) {
        return this.api.get<Patient>(`${API_PATH}/patients/${id}`);
    }

    updatePatient(id: number, paciente: Patient) {
        return this.api.put<Patient>(`${API_PATH}/patients/${id}`, paciente);
    }

    deletePatient(id: number) {
        return this.api.delete<null>(`${API_PATH}/patients/${id}`);
    }
}
