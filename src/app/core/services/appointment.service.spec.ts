import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AppointmentService } from './appointment.service';

const envelope = <T>(data: T) => ({
  success: true,
  message: 'ok',
  data,
  errors: null,
  requestId: 'request-1'
});

const localAppointment = {
  id: 6,
  patientId: 1,
  patient: { id: 1, name: 'Monserrat', lastName: 'Salas' },
  startsAt: '2026-09-12T20:00:00.000Z',
  endsAt: '2026-09-12T21:00:00.000Z',
  timeZone: 'America/Mexico_City',
  status: 'SCHEDULED',
  reason: 'Cita de seguimiento',
  note: null
};

describe('AppointmentService', () => {
  let http: HttpTestingController;
  let service: AppointmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AppointmentService);
  });

  afterEach(() => http.verify());

  it('returns local appointments when Google Calendar is unavailable', () => {
    let result: ReturnType<typeof service.listAppointments> extends import('rxjs').Observable<infer T> ? T : never;

    service.listAppointments('2026-09-01', '2026-09-30').subscribe(response => {
      result = response;
    });

    http.expectOne(request => request.url === `${environment.API_URL}/appointments`)
      .flush(envelope([localAppointment]));

    // Local data is emitted without waiting for the external request to finish.
    expect(result!.data?.length).toBe(1);
    expect(result!.data?.[0].id).toBe(6);

    http.expectOne(request => request.url === `${environment.API_URL}/calendar/external-events`)
      .flush({ errors: [{ code: 'CALENDAR_PROVIDER_UNAVAILABLE', message: 'Google no disponible' }] }, { status: 503, statusText: 'Service Unavailable' });

    expect(result!.data?.length).toBe(1);
    expect(result!.data?.[0].patientFullName).toBe('Monserrat Salas');
  });

  it('merges Google events after local appointments when the provider responds', () => {
    let ids: number[] = [];

    service.listAppointments('2026-09-01', '2026-09-30').subscribe(response => {
      ids = (response.data ?? []).map(appointment => appointment.id);
    });

    http.expectOne(request => request.url === `${environment.API_URL}/appointments`)
      .flush(envelope([localAppointment]));
    http.expectOne(request => request.url === `${environment.API_URL}/calendar/external-events`)
      .flush(envelope([{
        id: 'google-event-1',
        summary: 'Evento externo',
        startsAt: '2026-09-13T16:00:00.000Z',
        endsAt: '2026-09-13T17:00:00.000Z',
        allDay: false
      }]));

    expect(ids).toEqual([6, 0]);
  });

  it('loads only local appointments for a patient summary', () => {
    let ids: number[] = [];

    service.listPatientAppointments(1, '2026-09-01', '2027-08-31').subscribe(response => {
      ids = (response.data ?? []).map(appointment => appointment.id);
    });

    const request = http.expectOne(req => req.url === `${environment.API_URL}/appointments`);
    expect(request.request.params.get('patientId')).toBe('1');
    expect(request.request.params.get('pageSize')).toBe('100');
    request.flush(envelope([localAppointment]));

    expect(ids).toEqual([6]);
    http.expectNone(request => request.url === `${environment.API_URL}/calendar/external-events`);
  });
});
