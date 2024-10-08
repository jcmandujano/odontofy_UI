import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment } from '../models/payment.model';
const PATH_API = environment.API_URL;
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class PaymentService{
    constructor(private http: HttpClient) { }   

    listPayments(patientId: number){
        return this.http.get<Payment[]>(`${PATH_API}/patients/${patientId}/payment `, httpOptions).pipe(
            map((response: any)=> {
                return response
            })
        );
    }

    createPayment(patientId: number, newPayment: Payment){
        return this.http.post(`${PATH_API}/patients/${patientId}/payment `,  newPayment , httpOptions);
    }

    deletePayment(patientId: number, paymentId: number): Observable<any> {
        return this.http.delete(`${PATH_API}/patients/${patientId}/payment/${paymentId}` , httpOptions);
    }

    updatePayment(paymentId: number, patientId: number, newPayment: Payment){
        return this.http.patch(`${PATH_API}/patients/${patientId}/payment/${paymentId}`,  newPayment , httpOptions);
    }

}