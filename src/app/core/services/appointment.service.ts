import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Appointment } from '../models/appointment.model';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse } from '../../core/models/api-response.model';

const API_PATH = environment.API_URL;

@Injectable({
    providedIn: 'root'
})

export class AppointmentService {
    constructor(private api: ApiService) { }

    createAppointment(appointment: Appointment) {
        return this.api.post(`${API_PATH}/appointments`, appointment);
    }

    listAppointments(page = 1, limit = 10) {
        return this.api.get<PaginatedResponse<Appointment>>(
            `${API_PATH}/appointments?fromToday=true&page=${page}&limit=${limit}`
        );
    }

    findAppointment(id: any) {
        return this.api.get<Appointment>(`${API_PATH}/appointments/${id}`);
    }

    updateAppointment(id: number, appointment: Appointment) {
        return this.api.put<Appointment>(`${API_PATH}/appointments/${id}`, appointment);
    }

    deleteAppointment(id: number) {
        return this.api.delete<null>(`${API_PATH}/appointments/${id}`);
    }
}