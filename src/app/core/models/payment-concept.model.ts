export class PaymentConcept{ 
    id!: number;
    paymentId!: number;
    conceptId!: number;
    paymentMethod!:string;
    quantity!: number;
    description!: string;

    constructor(data?: Partial<PaymentConcept>) {
        if (data) {
            Object.assign(this, data);
        }
    }
}