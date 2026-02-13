import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Payment } from '../models/payment.model';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse } from '../../core/models/api-response.model';

const API_PATH = environment.API_URL;

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    constructor(private api: ApiService) { }

    listPayments(patientId: number, page = 1, limit = 10) {
        return this.api.get<PaginatedResponse<Payment>>(
            `${API_PATH}/patients/${patientId}/payment?page=${page}&limit=${limit}`
        );
    }

    getPaymentBalance() {
        return this.api.get<any>(`${API_PATH}/patients/payment/payment-balance?currentMonthOnly=true`);
    }

    createPayment(patientId: number, newPayment: Payment) {
        return this.api.post<Payment>(`${API_PATH}/patients/${patientId}/payment`, newPayment);
    }

    updatePayment(paymentId: number, patientId: number, newPayment: Payment) {
        return this.api.patch<Payment>(`${API_PATH}/patients/${patientId}/payment/${paymentId}`, newPayment);
    }

    deletePayment(patientId: number, paymentId: number) {
        return this.api.delete<null>(`${API_PATH}/patients/${patientId}/payment/${paymentId}`);
    }
}
