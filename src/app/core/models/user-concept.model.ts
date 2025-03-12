export class UserConcept{
    id!: number;
    user_id!: number;
    concept_id!: number;
    description!: String;
    unit_price!: number;
    is_custom!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(){
        this.id = 0
        this.description = ''
        this.unit_price = 0
    }
}