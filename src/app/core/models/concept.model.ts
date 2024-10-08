export class Concept{
    id!: number;
    description!: String;
    unit_price!: number;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(){
        this.id = 0
        this.description = ''
        this.unit_price = 0
    }
}