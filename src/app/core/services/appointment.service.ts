import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, of, throwError } from 'rxjs';
import { ApiV1Appointment } from '../models/api-v1.model';
import { toApiAppointment, toUiAppointment } from '../models/api-v1.mapper';
import { mapApiResponse } from '../models/api-response.model';
import { Appointment } from '../models/appointment.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
    constructor(private api: ApiService) { }

    createAppointment(appointment: Appointment) {
        return this.api.post<ApiV1Appointment>('/appointments', toApiAppointment(appointment)).pipe(
            map(response => mapApiResponse(response, toUiAppointment))
        );
    }

    listAppointments(startDate?: string, endDate?: string) {
        const now = new Date();
        const from = startDate ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const to = endDate ?? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
        const fromBoundary = this.rangeBoundary(from, false);
        const toBoundary = this.rangeBoundary(to, true);
        const params = { from: fromBoundary, to: toBoundary, pageSize: 100 };
        const externalParams = {
            from: fromBoundary,
            to: toBoundary,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City'
        };
        return forkJoin({
            local: this.api.get<ApiV1Appointment[]>('/appointments', { params }),
            external: this.api.get<ApiExternalCalendarEvent[]>('/calendar/external-events', { params: externalParams }).pipe(
                catchError(error => error.status === 409 ? of(null) : throwError(() => error))
            )
        }).pipe(map(({ local, external }) => mapApiResponse(local, values => [
            ...values.map(toUiAppointment),
            ...(external?.data ?? []).filter(event => event.startsAt && event.endsAt).map(toUiExternalAppointment)
        ])));
    }

    findAppointment(id: number) {
        return this.api.get<ApiV1Appointment>(`/appointments/${id}`).pipe(
            map(response => mapApiResponse(response, toUiAppointment))
        );
    }

    updateAppointment(id: number, appointment: Appointment) {
        return this.api.patch<ApiV1Appointment>(`/appointments/${id}`, toApiAppointment(appointment)).pipe(
            map(response => mapApiResponse(response, toUiAppointment))
        );
    }

    deleteAppointment(id: number) {
        return this.api.delete<ApiV1Appointment>(`/appointments/${id}`).pipe(
            map(response => mapApiResponse(response, toUiAppointment))
        );
    }

    private rangeBoundary(value: string, endOfDay: boolean): string {
        if (value.includes('T')) return new Date(value).toISOString();
        return new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`).toISOString();
    }
}

interface ApiExternalCalendarEvent {
    id: string;
    summary: string | null;
    startsAt: string | null;
    endsAt: string | null;
    allDay: boolean;
}

const toUiExternalAppointment = (value: ApiExternalCalendarEvent): Appointment => new Appointment(
    0,
    0,
    value.startsAt!,
    value.endsAt!,
    '',
    value.summary ?? 'Evento de Google Calendar',
    value.id,
    'EXTERNAL'
);
