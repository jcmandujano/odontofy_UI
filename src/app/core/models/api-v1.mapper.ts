import { Appointment } from './appointment.model';
import { ApiV1Appointment, ApiV1Patient, ApiV1User } from './api-v1.model';
import { Patient } from './patient.model';
import { User } from './user.model';

export const toUiUser = (value: ApiV1User): User => Object.assign(new User(), {
  id: value.id,
  name: value.name,
  middle_name: value.middleName,
  last_name: value.lastName,
  date_of_birth: value.dateOfBirth ? new Date(`${value.dateOfBirth}T00:00:00`) : undefined,
  phone: value.phone,
  avatar: value.avatar,
  email: value.email,
  show_finance_stats: value.showFinanceStats,
  is_google_synced: value.isGoogleSynced
});

export const toUiPatient = (value: ApiV1Patient): Patient => Object.assign(new Patient(), {
  id: value.id,
  name: value.name,
  middle_name: value.middleName ?? '',
  last_name: value.lastName,
  gender: value.gender ?? '',
  date_of_birth: value.dateOfBirth ? new Date(`${value.dateOfBirth}T00:00:00`) : new Date(),
  phone: value.phone ?? '',
  marital_status: value.maritalStatus ?? '',
  occupation: value.occupation ?? '',
  address: value.address ?? '',
  emergency_contact_name: value.emergencyContactName ?? '',
  emergency_contact_phone: value.emergencyContactPhone ?? '',
  emergency_contact_relationship: value.emergencyContactRelationship ?? '',
  reason_for_consultation: value.reasonForConsultation ?? '',
  rfc: value.rfc ?? '',
  family_medical_history: value.familyMedicalHistory ?? {},
  personal_medical_history: value.personalMedicalHistory ?? {},
  email: value.email ?? '',
  status: value.active,
  debt: Number(value.currentBalance ?? 0)
});

export const toApiPatient = (value: Partial<Patient>) => ({
  ...(value.name !== undefined && { name: value.name }),
  ...(value.middle_name !== undefined && { middleName: value.middle_name || null }),
  ...(value.last_name !== undefined && { lastName: value.last_name }),
  ...(value.gender !== undefined && { gender: value.gender || null }),
  ...(value.date_of_birth !== undefined && { dateOfBirth: toDate(value.date_of_birth) }),
  ...(value.phone !== undefined && { phone: value.phone || null }),
  ...(value.marital_status !== undefined && { maritalStatus: value.marital_status || null }),
  ...(value.occupation !== undefined && { occupation: value.occupation || null }),
  ...(value.address !== undefined && { address: value.address || null }),
  ...(value.emergency_contact_name !== undefined && { emergencyContactName: value.emergency_contact_name || null }),
  ...(value.emergency_contact_phone !== undefined && { emergencyContactPhone: value.emergency_contact_phone || null }),
  ...(value.emergency_contact_relationship !== undefined && { emergencyContactRelationship: value.emergency_contact_relationship || null }),
  ...(value.reason_for_consultation !== undefined && { reasonForConsultation: value.reason_for_consultation || null }),
  ...(value.rfc !== undefined && { rfc: value.rfc || null }),
  ...(value.email !== undefined && { email: value.email || null })
});

export const toUiAppointment = (value: ApiV1Appointment): Appointment => new Appointment(
  value.id,
  value.patientId ?? 0,
  value.startsAt,
  value.endsAt,
  value.note ?? '',
  value.reason ?? '',
  '',
  value.status
);

export const toApiAppointment = (value: Appointment) => ({
  patientId: value.patient_id,
  startsAt: new Date(value.appointment_datetime).toISOString(),
  endsAt: new Date(value.appointment_end_datetime).toISOString(),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City',
  reason: value.reason || null,
  note: value.note || null
});

export const toDate = (value: Date | string | { format: (pattern: string) => string } | null | undefined): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return value.format('YYYY-MM-DD');
};
