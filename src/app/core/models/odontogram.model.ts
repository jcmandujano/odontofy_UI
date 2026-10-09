import { TreatmentPlanItemStatus } from './treatment-plan.model';

export type OdontogramDentition = 'ADULT' | 'PEDIATRIC';
export type OdontogramCondition =
  | 'HEALTHY' | 'MISSING' | 'NOT_ERUPTED' | 'RESTORATION' | 'CROWN'
  | 'ROOT_CANAL' | 'IMPLANT' | 'CARIES' | 'FRACTURE'
  | 'EXTRACTION_INDICATED' | 'OTHER';
export type OdontogramSurface =
  | 'MESIAL' | 'DISTAL' | 'VESTIBULAR' | 'LINGUAL_PALATAL'
  | 'OCCLUSAL_INCISAL';

export interface OdontogramFindingInput {
  toothCode: string;
  condition: OdontogramCondition;
  surface: OdontogramSurface | null;
  notes: string | null;
}

export interface OdontogramTreatmentItem {
  id: number;
  treatmentPlanId: number;
  userConceptId: number | null;
  name: string;
  status: TreatmentPlanItemStatus;
}

export interface OdontogramFinding extends OdontogramFindingInput {
  id: number;
  odontogramId: number;
  treatmentPlanItemIds: number[];
  treatmentPlanItems: OdontogramTreatmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OdontogramSummary {
  id: number;
  patientId: number;
  dentition: OdontogramDentition;
  title: string | null;
  author: { userId: number; name: string };
  occurredAt: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Odontogram extends OdontogramSummary {
  findings: OdontogramFinding[];
}

export const ODONTOGRAM_CONDITIONS: ReadonlyArray<{ value: OdontogramCondition; label: string }> = [
  { value: 'CARIES', label: 'Caries' },
  { value: 'FRACTURE', label: 'Fractura' },
  { value: 'RESTORATION', label: 'Restauración' },
  { value: 'CROWN', label: 'Corona' },
  { value: 'ROOT_CANAL', label: 'Endodoncia' },
  { value: 'IMPLANT', label: 'Implante' },
  { value: 'EXTRACTION_INDICATED', label: 'Extracción indicada' },
  { value: 'MISSING', label: 'Ausente' },
  { value: 'NOT_ERUPTED', label: 'Sin erupcionar' },
  { value: 'OTHER', label: 'Otro' },
  { value: 'HEALTHY', label: 'Sano' },
];

export const ODONTOGRAM_SURFACES: ReadonlyArray<{ value: OdontogramSurface; label: string }> = [
  { value: 'MESIAL', label: 'Mesial' },
  { value: 'DISTAL', label: 'Distal' },
  { value: 'VESTIBULAR', label: 'Vestibular' },
  { value: 'LINGUAL_PALATAL', label: 'Lingual / palatina' },
  { value: 'OCCLUSAL_INCISAL', label: 'Oclusal / incisal' },
];

export const WHOLE_TOOTH_CONDITIONS = new Set<OdontogramCondition>([
  'HEALTHY', 'MISSING', 'NOT_ERUPTED', 'CROWN', 'ROOT_CANAL',
  'IMPLANT', 'EXTRACTION_INDICATED',
]);

export const EXCLUSIVE_TOOTH_CONDITIONS = new Set<OdontogramCondition>([
  'HEALTHY', 'MISSING', 'NOT_ERUPTED',
]);

export interface ToothQuadrant {
  label: string;
  codes: string[];
}

export function quadrantsForDentition(dentition: OdontogramDentition): ToothQuadrant[] {
  const count = dentition === 'ADULT' ? 8 : 5;
  const [upperRight, upperLeft, lowerRight, lowerLeft] = dentition === 'ADULT'
    ? ['1', '2', '4', '3']
    : ['5', '6', '8', '7'];
  const descending = (prefix: string) => Array.from({ length: count }, (_, index) => `${prefix}${count - index}`);
  const ascending = (prefix: string) => Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
  return [
    { label: 'Superior derecho', codes: descending(upperRight) },
    { label: 'Superior izquierdo', codes: ascending(upperLeft) },
    { label: 'Inferior derecho', codes: descending(lowerRight) },
    { label: 'Inferior izquierdo', codes: ascending(lowerLeft) },
  ];
}

export function toothAsset(code: string, dentition: OdontogramDentition): string {
  const position = Number(code[1]);
  const name = dentition === 'PEDIATRIC'
    ? ['incisivo_central', 'incisivo_lateral', 'canino', 'primer_molar', 'segundo_molar'][position - 1]
    : ['incisivo_central', 'incisivo_lateral', 'canino', 'primer_premolar', 'segundo_premolar', 'primer_molar', 'segundo_molar', 'tercer_molar'][position - 1];
  return `/odontogram-elements/${name}.png`;
}
