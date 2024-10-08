import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.model';
const API_PATH = environment.API_URL;
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
    providedIn: 'root'
})

export class PacientesService {
    constructor(private http: HttpClient) { }

    createPatient(paciente: Patient){ //crear modelo de paciente
        return this.http.post(API_PATH + '/patients',  paciente , httpOptions);
    }

    listPatients(){
        return this.http.get<Patient[]>(API_PATH + '/patients', httpOptions).pipe(
            map((response: any)=> {
                return response
            })
        );
    }

    findPatient(id: any){
        return this.http.get(`${API_PATH}/patients/${id}`, httpOptions).pipe(
            map((response: any)=> {
                return response
            })
        );
    }
    
    updatePatient(id: any, paciente: Patient){
        return this.http.put(`${API_PATH}/patients/${id}`, paciente, httpOptions);
    }

    deletePatient(id: any){
        return this.http.delete(`${API_PATH}/patients/${id}`, httpOptions);
    }
}