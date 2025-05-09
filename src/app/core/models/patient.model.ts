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
    public debt!: number

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
        this.debt = 0
    }

    static fromJson(data: any): Patient {
        const p = new Patient();
        Object.assign(p, data);
    
        // Transformaciones específicas
        p.debt = Number(data.debt ?? 0);
        p.date_of_birth = data.date_of_birth ? new Date(data.date_of_birth) : new Date();
        p.status = Boolean(data.status);
    
        return p;
    }
}