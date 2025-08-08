import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Concept } from '../models/concept.model';
import { ApiService } from '../../core/services/api.service';

const PATH_API = environment.API_URL;

@Injectable({
    providedIn: 'root'
})

export class ConceptsService {
    constructor(private api: ApiService) { }

    listConcepts() {
        return this.api.get<Concept[]>(`${PATH_API}/concepts`);
    }

} 