import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment } from '../models/appointment.model';
const PATH_API = environment.API_URL;
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class AppointmentService{
    constructor(private http: HttpClient) { }

    createAppointment(appointment: Appointment){
        return this.http.post(`${PATH_API}/appointments`, appointment , httpOptions);
    }

    listAppointments(){
        return this.http.get<Appointment[]>(`${PATH_API}/appointments`, httpOptions).pipe(
            map((response: any)=> {
                return response
            })
        );
    }

    findAppointment(appointment_id: any, criteria: string){
        return this.http.get<Appointment[]>(`${PATH_API}/appointments/${appointment_id}?&criterio=${criteria}`, httpOptions).pipe(
            map((response: any)=> {
                return response
            })
        );
    }
    
    updateAppointment(appointment_id: number, appointment: Appointment){
        return this.http.put(`${PATH_API}/appointments/${appointment_id}`, appointment, httpOptions);
    }

    deleteAppointment(appointment_id: number){
        return this.http.delete(`${PATH_API}/appointments/${appointment_id}`, httpOptions);
    }
}