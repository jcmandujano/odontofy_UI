export type ISODateString = string;

export enum TreatmentPlanStatus {
    DRAFT = 'DRAFT',
    PROPOSED = 'PROPOSED',
    ACCEPTED = 'ACCEPTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum TreatmentPlanItemStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum TreatmentPlanItemPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

// La API documentada responde en snake_case. Si la UI usa camelCase, mapear antes de renderizar.
export interface TreatmentPlan {
    id: number;
    user_id: number;
    patient_id: number;
    title: string;
    description: string | null;
    diagnosis: string | null;
    patient_complaint: string | null;
    clinical_observations: string | null;
    prognosis: string | null;
    status: TreatmentPlanStatus;
    estimated_start_date: ISODateString | null;
    estimated_end_date: ISODateString | null;
    accepted_at: ISODateString | null;
    rejected_at: ISODateString | null;
    acceptance_notes: string | null;
    subtotal: number | string;
    discount: number | string;
    total: number | string;
    created_at?: ISODateString;
    updated_at?: ISODateString;
    TreatmentPlanItems?: TreatmentPlanItem[];
}

export interface TreatmentPlanItem {
    id: number;
    treatment_plan_id: number;
    user_concept_id: number | null;
    name: string;
    description: string | null;
    tooth: string | null;
    area: string | null;
    quantity: number | string;
    unit_price: number | string;
    subtotal: number | string;
    phase: string | null;
    priority: TreatmentPlanItemPriority | null;
    status: TreatmentPlanItemStatus;
    notes: string | null;
    sort_order: number;
    completed_at: ISODateString | null;
    created_at?: ISODateString;
    updated_at?: ISODateString;
}

export interface CreateTreatmentPlanRequest {
    title: string;
    description?: string | null;
    diagnosis?: string | null;
    patient_complaint?: string | null;
    clinical_observations?: string | null;
    prognosis?: string | null;
    estimated_start_date?: ISODateString | null;
    estimated_end_date?: ISODateString | null;
    acceptance_notes?: string | null;
    discount?: number;
}

export interface UpdateTreatmentPlanRequest {
    title?: string;
    description?: string | null;
    diagnosis?: string | null;
    patient_complaint?: string | null;
    clinical_observations?: string | null;
    prognosis?: string | null;
    estimated_start_date?: ISODateString | null;
    estimated_end_date?: ISODateString | null;
    acceptance_notes?: string | null;
    discount?: number;
}

export interface UpdateTreatmentPlanStatusRequest {
    status: TreatmentPlanStatus;
    acceptance_notes?: string | null;
}

export interface CreateTreatmentPlanItemRequest {
    user_concept_id?: number | null;
    name: string;
    description?: string | null;
    tooth?: string | null;
    area?: string | null;
    quantity: number;
    unit_price: number;
    phase?: string | null;
    priority?: TreatmentPlanItemPriority | null;
    notes?: string | null;
    sort_order?: number;
}

export interface UpdateTreatmentPlanItemRequest {
    user_concept_id?: number | null;
    name?: string;
    description?: string | null;
    tooth?: string | null;
    area?: string | null;
    quantity?: number;
    unit_price?: number;
    phase?: string | null;
    priority?: TreatmentPlanItemPriority | null;
    notes?: string | null;
    sort_order?: number;
}

export interface UpdateTreatmentPlanItemStatusRequest {
    status: TreatmentPlanItemStatus;
}

export type TreatmentPlanListResponse = TreatmentPlan[];

export type TreatmentPlanDetailResponse = TreatmentPlan;

export interface TreatmentPlanItemMutationResponse {
    item: TreatmentPlanItem;
    treatmentPlan: TreatmentPlan;
}

export interface DeleteTreatmentPlanItemResponse {
    treatmentPlan: TreatmentPlan;
}
