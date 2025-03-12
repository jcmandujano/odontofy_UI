import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserInformedConsent } from '../models/user-consent.model';


const PATH_API = environment.API_URL;
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class UserConsentService {
    constructor(private http: HttpClient) { }   

    listUserConsent(){
        return this.http.get<UserInformedConsent[]>(`${PATH_API}/user-informed-consents`, httpOptions).pipe(
            map((response: any)=> {
                return response.consents
            })
        );
    }

    createUserConsent(concept: UserInformedConsent){
        return this.http.post(`${PATH_API}/user-informed-consents`, concept, httpOptions);
    }   

    updateUserConsent(id: number, concept: UserInformedConsent){
        return this.http.put(`${PATH_API}/user-informed-consents/${id}`, concept, httpOptions);
    }

    deleteUserConsent(id: number){
        return this.http.delete(`${PATH_API}/user-informed-consents/${id}`, httpOptions);
    }

    getUserConsent(id: number){
        return this.http.get<UserInformedConsent>(`${PATH_API}/user-informed-consents/${id}`, httpOptions);
    }

}