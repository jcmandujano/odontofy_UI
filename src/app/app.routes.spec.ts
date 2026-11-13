import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, convertToParamMap, provideRouter } from '@angular/router';
import { redirectLegacyTreatmentRoute } from './app.routes';

describe('Legacy treatment navigation', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  const redirect = (path: string, params: Record<string, string>) => TestBed.runInInjectionContext(() =>
    redirectLegacyTreatmentRoute({ routeConfig: { path }, paramMap: convertToParamMap(params) } as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as UrlTree);

  it('preserves the patient from the old treatment list', () => {
    expect(TestBed.inject(Router).serializeUrl(redirect('patient-treatment-plans', { id: '7' }))).toBe('/patient-dashboard;id=7');
  });
  it('uses patientId rather than the plan id from old detail links', () => {
    expect(TestBed.inject(Router).serializeUrl(redirect('treatment-plan-detail', { id: '99', patientId: '7' }))).toBe('/patient-dashboard;id=7');
  });
  it('returns to patients when an old link has no valid patient', () => {
    expect(TestBed.inject(Router).serializeUrl(redirect('treatment-plan-detail', { id: '99' }))).toBe('/patient-list');
  });
});
