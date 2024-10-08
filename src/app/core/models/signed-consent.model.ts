export class SignedConsent {
    id!: number
    consent_id!: number
    consent_name?: string
    patient_id!: number
    doctor_id!: number
    signed_date?: string
    file_url?: string
    createdAt?: string
    updatedAt?: string

    constructor(){
    }
}
