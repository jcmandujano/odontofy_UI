import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Concept } from '../models/concept.model';

const PATH_API = environment.API_URL;
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class ConceptsService {
    constructor(private http: HttpClient) { }   

    listConcepts(){
        return this.http.get<Concept[]>(`${PATH_API}/concepts`, httpOptions).pipe(
            map((response: any)=> {
                return response.concepts
            })
        );
    }

}