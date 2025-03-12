import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserConcept } from '../models/user-concept.model';


const PATH_API = environment.API_URL;
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class UserConceptsService {
    constructor(private http: HttpClient) { }   

    listUserConcepts(){
        return this.http.get<UserConcept[]>(`${PATH_API}/user-concepts`, httpOptions).pipe(
            map((response: any)=> {
                return response.concepts
            })
        );
    }

    createUserConcept(concept: UserConcept){
        return this.http.post(`${PATH_API}/user-concepts`, concept, httpOptions);
    }   

    updateUserConcept(id: number, concept: UserConcept){
        return this.http.put(`${PATH_API}/user-concepts/${id}`, concept, httpOptions);
    }

    deleteUserConcept(id: number){
        return this.http.delete(`${PATH_API}/user-concepts/${id}`, httpOptions);
    }

    getUserConcept(id: number){
        return this.http.get<UserConcept>(`${PATH_API}/user-concepts/${id}`, httpOptions);
    }

}