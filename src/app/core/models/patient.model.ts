export class Patient {
    public id!: number;
    public user_id!: number;
    public name!: string
    public middle_name!: string
    public last_name!: string
    public gender!: string
    public date_of_birth!: Date
    public phone!: string
    public marital_status!: string
    public occupation!: string
    public address!: string
    public emergency_contact_name!: string
    public emergency_contact_phone!: string
    public emergency_contact_relationship!: string
    public reason_for_consultation!: string
    public rfc!: string
    public family_medical_history!: {}
    public personal_medical_history!: {}
    public email!: string
    public status!: boolean

    constructor(){
        this.name = ''
        this.middle_name = ''
        this.last_name = ''
        this.gender = ''
        this.date_of_birth = new Date()
        this.phone = ''
        this.marital_status = ''
        this.occupation = ''
        this.address = ''
        this.emergency_contact_name = ''
        this.emergency_contact_phone = ''
        this.emergency_contact_relationship = ''
        this.reason_for_consultation = ''
        this.rfc = ''
        this.family_medical_history = {}
        this.personal_medical_history = {}
        this.email = ''
        this.status = false
    }
}