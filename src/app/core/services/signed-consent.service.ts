import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { environment } from "../../../environments/environment";
import { SignedConsent } from "../models/signed-consent.model";


const PATH_API = environment.API_URL;
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
    providedIn: 'root'
})
export class SignedConsentService{
    constructor(private http: HttpClient) { }

    listSignedConsents(){
        return this.http.get(`${PATH_API}/signed-consents`, httpOptions).pipe(
            map((response: any)=> {
                return response
            })
        );
    }

    getSignedConsents(id:number){
        return this.http.get(`${PATH_API}/signed-consents/${id}`, httpOptions).pipe(
            map((response: any)=> {
                return response
            })
        );
    }

    createSignedConsents(signedConsent: SignedConsent){
        return this.http.post(`${PATH_API}/signed-consents/`, signedConsent , httpOptions);
    }

    deleteSignedConsent(id:number){
        return this.http.delete(`${PATH_API}/signed-consents/${id}`, httpOptions);
    }
}