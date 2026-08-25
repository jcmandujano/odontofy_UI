import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { mapApiResponse } from '../models/api-response.model';
import { InformedConsent } from '../models/informed-consent.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InformedConsentService {
    constructor(private api: ApiService) { }

    listInformedConsents() {
        return this.api.get<Array<{ id: number; name: string; description: string | null }>>('/consent-catalog').pipe(
            map(response => mapApiResponse(response, values => values.map(value => Object.assign(new InformedConsent(), {
                id: value.id,
                name: value.name,
                description: value.description
            }))))
        );
    }
}
