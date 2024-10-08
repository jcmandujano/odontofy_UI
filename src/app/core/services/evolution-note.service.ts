import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EvolutionNote } from '../models/evolution-note.model';
const PATH_API = environment.API_URL;
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class EvolutionNoteService{
    constructor(private http: HttpClient) { }

    createNote(patient_id:any, nota: EvolutionNote){
        return this.http.post(`${PATH_API}/patients/${patient_id}/notes/`, nota , httpOptions);
    }

    listNotes(id:any){
        return this.http.get<EvolutionNote[]>(`${PATH_API}/patients/${id}/notes/`, httpOptions).pipe(
            map((response: any)=> {
                return response
            })
        );
    }

    findNote(patient_id: any, criteria: string){
        return this.http.get<EvolutionNote[]>(`${PATH_API}/nota-de-evolucions?paciente=${patient_id}&criterio=${criteria}`, httpOptions).pipe(
            map((response: any)=> {
                return response
            })
        );
    }
    
    updateNote(patient_id: any, nota_id: number, nota: EvolutionNote){
        return this.http.put(`${PATH_API}/patients/${patient_id}/notes/${nota_id}`, nota, httpOptions);
    }

    deleteNote(patient_id: any, nota_id: number){
        return this.http.delete(`${PATH_API}/patients/${patient_id}/notes/${nota_id}`, httpOptions);
    }
}