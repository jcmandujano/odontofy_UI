export class EvolutionNote {
    id!: number
    note!: string
    createdAt!: string
    updatedAt?: string
    patient_id!: number
    treatment_plan_id!: number | null
    treatment_plan_item_id!: number | null

    constructor(){
        this.note = ''
        this.treatment_plan_id = null
        this.treatment_plan_item_id = null
    }
}

export interface CreateEvolutionNoteRequest {
    note: string;
    treatment_plan_id?: number | null;
    treatment_plan_item_id?: number | null;
}

export interface UpdateEvolutionNoteRequest {
    note?: string;
    treatment_plan_id?: number | null;
    treatment_plan_item_id?: number | null;
}

export interface EvolutionNoteFilters {
    treatment_plan_id?: number | null;
    treatment_plan_item_id?: number | null;
}
