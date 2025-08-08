export class SignedConsent {
    id!: number;
    consent_id!: number;
    consent_name?: string; // Se mantiene si mapeas 'consent.name' manualmente
    patient_id!: number;
    doctor_id!: number;
    signed_date?: string;
    file_url?: string;
    createdAt?: string;
    updatedAt?: string;

    // Relación completa (opcional: si quieres acceder a más que solo 'name')
    consent?: {
        id: number;
        name: string;
    };

    constructor(init?: Partial<SignedConsent>) {
        Object.assign(this, init);
    }
}
