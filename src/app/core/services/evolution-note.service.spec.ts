import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EvolutionNoteService } from './evolution-note.service';

describe('General patient notes', () => {
  let service: EvolutionNoteService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(EvolutionNoteService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('creates a dated note without requiring a plan or treatment', () => {
    service.createNote(7, { note: '<p>Revisión</p>', occurredAt: '2026-11-12T12:00:00.000Z' }).subscribe();
    const request = http.expectOne(req => req.url.endsWith('/patients/7/evolution-notes'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ note: '<p>Revisión</p>', occurredAt: '2026-11-12T12:00:00.000Z' });
    request.flush({ success: true, data: null });
  });

  it('amends content and date without clearing historical references', () => {
    service.updateNote(7, 11, { note: '<p>Corrección</p>', occurredAt: '2026-11-11T12:00:00.000Z' }).subscribe();
    const request = http.expectOne(req => req.url.endsWith('/patients/7/evolution-notes/11'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.treatmentPlanId).toBeUndefined();
    expect(request.request.body.treatmentPlanItemId).toBeUndefined();
    expect(request.request.body.occurredAt).toBe('2026-11-11T12:00:00.000Z');
    expect(request.request.body.changeReason).toBeTruthy();
    request.flush({ success: true, data: null });
  });
});
