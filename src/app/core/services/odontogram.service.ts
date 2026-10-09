import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { mapPaginatedApiResponse } from '../models/api-response.model';
import {
  Odontogram,
  OdontogramDentition,
  OdontogramFindingInput,
  OdontogramSummary,
} from '../models/odontogram.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OdontogramService {
  constructor(private readonly api: ApiService) {}

  list(patientId: number, page = 1) {
    return this.api.get<OdontogramSummary[]>(`/patients/${patientId}/odontograms`, {
      params: { page, pageSize: 100, status: 'all' },
    }).pipe(map(response => mapPaginatedApiResponse(response, value => value)));
  }

  get(odontogramId: number) {
    return this.api.get<Odontogram>(`/odontograms/${odontogramId}`);
  }

  create(patientId: number, dentition: OdontogramDentition, title: string | null) {
    return this.api.post<Odontogram>(`/patients/${patientId}/odontograms`, {
      dentition,
      title,
      findings: [],
    });
  }

  update(odontogramId: number, title: string | null, findings: OdontogramFindingInput[]) {
    return this.api.patch<Odontogram>(`/odontograms/${odontogramId}`, { title, findings });
  }

  archive(odontogramId: number) {
    return this.api.delete<Odontogram>(`/odontograms/${odontogramId}`);
  }

  restore(odontogramId: number) {
    return this.api.post<Odontogram>(`/odontograms/${odontogramId}/restore`, {});
  }

  link(odontogramId: number, findingId: number, itemId: number) {
    return this.api.put<Odontogram>(this.linkPath(odontogramId, findingId, itemId), {});
  }

  unlink(odontogramId: number, findingId: number, itemId: number) {
    return this.api.delete<Odontogram>(this.linkPath(odontogramId, findingId, itemId));
  }

  private linkPath(odontogramId: number, findingId: number, itemId: number): string {
    return `/odontograms/${odontogramId}/findings/${findingId}/treatment-items/${itemId}`;
  }
}
