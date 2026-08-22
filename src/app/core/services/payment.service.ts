import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { mapApiResponse, mapPaginatedApiResponse } from '../models/api-response.model';
import { Payment } from '../models/payment.model';
import { PaymentBalance } from '../models/payment-balance.model';
import { ApiService } from './api.service';

interface ApiBillingRecord {
    id: number;
    patientId: number;
    occurredOn: string;
    subtotal: string;
    discount: string;
    total: string;
    amountReceived: string;
    balanceChange: string;
    balanceAfter: string;
    paymentMethod: string | null;
    items: Array<{
        id: number;
        billingRecordId: number;
        conceptId: number;
        description: string;
        unitPrice: string;
        quantity: number;
    }>;
}

interface ApiBillingSummary {
    totalBilled: string;
    totalReceived: string;
    totalDiscount: string;
    netChange: string;
    currentBalance: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
    constructor(private api: ApiService) { }

    listPayments(patientId: number, page = 1, limit = 10) {
        return this.api.get<ApiBillingRecord[]>(`/patients/${patientId}/billing-records`, {
            params: { page, pageSize: limit }
        }).pipe(map(response => mapPaginatedApiResponse(response, toUiPayment)));
    }

    getPaymentBalance() {
        const now = new Date();
        const dateFrom = localDate(new Date(now.getFullYear(), now.getMonth(), 1));
        const dateTo = localDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        return this.api.get<ApiBillingSummary>('/billing/summary', { params: { dateFrom, dateTo } }).pipe(
            map(response => mapApiResponse(response, value => Object.assign(new PaymentBalance(), {
                totalPayments: Number(value.totalBilled),
                totalDebt: Number(value.currentBalance),
                totalIncome: Number(value.totalReceived)
            })))
        );
    }

    createPayment(patientId: number, payment: Payment) {
        return this.api.post<ApiBillingRecord>(`/patients/${patientId}/billing-records`, paymentRequest(payment), {
            headers: { 'Idempotency-Key': crypto.randomUUID() }
        }).pipe(map(response => mapApiResponse(response, toUiPayment)));
    }

    updatePayment(paymentId: number, patientId: number, payment: Payment) {
        return this.api.put<ApiBillingRecord>(`/patients/${patientId}/billing-records/${paymentId}/correction`, {
            ...paymentRequest(payment),
            changeReason: 'Correccion solicitada desde la pantalla de pagos'
        }).pipe(map(response => mapApiResponse(response, toUiPayment)));
    }

    deletePayment(patientId: number, paymentId: number) {
        return this.api.post<ApiBillingRecord>(`/patients/${patientId}/billing-records/${paymentId}/cancellation`, {
            changeReason: 'Cancelacion solicitada desde la pantalla de pagos'
        }).pipe(map(response => mapApiResponse(response, toUiPayment)));
    }
}

const paymentRequest = (value: Payment) => {
    const amountReceived = Number(value.income ?? 0);
    const methods = new Set((value.concepts ?? []).map(item => item.paymentMethod));
    return {
        occurredOn: String(value.payment_date).slice(0, 10),
        discount: Number(value.discount ?? 0).toFixed(2),
        amountReceived: amountReceived.toFixed(2),
        paymentMethod: amountReceived === 0 ? null : methods.size > 1 ? 'MIXED' : methods.values().next().value,
        items: (value.concepts ?? []).map(item => ({
            conceptId: item.conceptId,
            quantity: Number(item.quantity)
        }))
    };
};

const toUiPayment = (value: ApiBillingRecord): Payment => new Payment({
    id: value.id,
    patientId: value.patientId,
    payment_date: value.occurredOn,
    subtotal: Number(value.subtotal),
    discount: Number(value.discount),
    income: Number(value.amountReceived),
    debt: Number(value.balanceChange),
    total: Number(value.total),
    concepts: value.items.map(item => ({
        id: item.id,
        paymentId: item.billingRecordId,
        conceptId: item.conceptId,
        paymentMethod: value.paymentMethod ?? '',
        quantity: item.quantity,
        description: item.description,
        unitPrice: Number(item.unitPrice)
    }))
});

const localDate = (value: Date): string => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
