import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { InformedConsent } from "../models/informed-consent.model";
import { ApiService } from "./api.service";

const PATH_API = environment.API_URL;

@Injectable({
    providedIn: 'root'
})
export class InformedConsentService {
    constructor(private api: ApiService) { }
    listInformedConsents() {
        return this.api.get<InformedConsent[]>(`${PATH_API}/informed-consents`);
    }
}