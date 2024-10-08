export class PaymentConcept{ 
    id!: number;
    paymentId!: number;
    conceptId!: number;
    payment_method!:string;
    quantity!: number;

    constructor(data?: Partial<PaymentConcept>) {
        if (data) {
            Object.assign(this, data);
        }
    }
}