export class UserInformedConsent{
    id!: number;
    user_id!: number;
    indormed_consent_id!: number;
    name!: string;
    description!: String;
    file_url!: string | null;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(){
        this.id = 0
        this.name = ''
        this.description = ''
        this.file_url = null
    }
}
