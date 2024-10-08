export class EvolutionNote {
    id!: number
    note!: string
    createdAt!: string
    patient_id!: number

    constructor(){
        this.note = ''
    }
}