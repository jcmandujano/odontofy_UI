import { PaymentConcept } from "./payment-concept.model";

export class Payment{
    id!: number;
    user_id!: number;
    patientId!: number;
    payment_date!: Date;
    income!: number;
    debt!: number;
    total!: number;
    concepts!: PaymentConcept[];
    displayConcepts!: string;

    constructor(data?: Partial<Payment>) {
        if (data) {
            Object.assign(this, data);
            
            // Convertir cada elemento del array `concepts` a una instancia de `PaymentConcept`
            if (data.concepts) {
                this.concepts = data.concepts.map(concept => new PaymentConcept(concept));
                // Generar displayConcepts con las descripciones separadas por comas
                this.displayConcepts = this.concepts.map(concept => concept.description).join(", ");
            } else {
                this.displayConcepts = ""; // Si no hay conceptos, dejar vacío
            }
        }
    }
}    