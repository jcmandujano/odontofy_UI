import { Injectable } from '@angular/core';
import { Patient } from '../models/patient.model';
import { ApiService } from './api.service';

type AnswerValue = 'YES' | 'NO' | 'UNKNOWN';

interface MedicalHistory {
  familyHistory: string | null;
  answers: Array<{ questionId: string; answer: AnswerValue; notes: string | null }>;
  otherNotes: string | null;
}

const questions: Record<string, string> = {
  bajoTratamientoMedico: 'MEDICAL_TREATMENT',
  intervencionQuirurgica: 'PRIOR_SURGERY',
  consumeDrogas: 'SUBSTANCE_USE',
  problemasPresion: 'HYPERTENSION',
  hepatitis: 'HEPATITIS',
  vih: 'HIV',
  ets: 'STI',
  problemaCorazon: 'HEART_DISEASE',
  fiebreReumatica: 'RHEUMATIC_FEVER',
  asma: 'ASTHMA',
  diabetes: 'DIABETES',
  ulceraGastrica: 'PEPTIC_ULCER',
  tiroides: 'THYROID_DISEASE',
  alergias: 'ALLERGIES',
  epilepsia: 'EPILEPSY',
  gastritis: 'GASTRITIS',
  embarazo: 'PREGNANCY'
};

@Injectable({ providedIn: 'root' })
export class ClinicalRecordService {
  constructor(private api: ApiService) { }

  getMedicalHistory(patientId: number) {
    return this.api.get<MedicalHistory>(`/patients/${patientId}/medical-history`);
  }

  updateMedicalHistory(patientId: number, patient: Partial<Patient>) {
    const personal = (patient.personal_medical_history ?? {}) as Record<string, { respuesta?: string; comentarios?: string }>;
    return this.api.put<MedicalHistory>(`/patients/${patientId}/medical-history`, {
      questionnaireVersion: '1.0',
      familyHistory: text(patient.family_medical_history),
      answers: Object.entries(questions).map(([legacyKey, questionId]) => ({
        questionId,
        answer: answer(personal[legacyKey]?.respuesta),
        notes: text(personal[legacyKey]?.comentarios)
      })),
      otherNotes: text(personal['otros']?.comentarios),
      changeReason: 'Actualización solicitada desde el expediente del paciente'
    });
  }

  applyToPatient(patient: Patient, history: MedicalHistory | null): Patient {
    if (!history) return patient;
    const byQuestion = new Map(history.answers.map(item => [item.questionId, item]));
    patient.family_medical_history = history.familyHistory ?? '';
    patient.personal_medical_history = Object.fromEntries([
      ...Object.entries(questions).map(([legacyKey, questionId]) => {
        const item = byQuestion.get(questionId);
        return [legacyKey, {
          respuesta: item?.answer === 'YES' ? 'si' : item?.answer === 'NO' ? 'no' : '',
          comentarios: item?.notes ?? ''
        }];
      }),
      ['otros', { comentarios: history.otherNotes ?? '' }]
    ]);
    return patient;
  }
}

const answer = (value?: string): AnswerValue => {
  const normalized = String(value ?? '').trim().toLocaleLowerCase('es-MX');
  if (normalized === 'si' || normalized === 'sí') return 'YES';
  if (normalized === 'no') return 'NO';
  return 'UNKNOWN';
};

const text = (value: unknown): string | null => {
  if (value === undefined || value === null || value === '') return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
};
