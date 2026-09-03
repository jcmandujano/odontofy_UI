export interface ApiV1User {
  id: number;
  name: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string;
  avatar: string;
  email: string;
  showFinanceStats: boolean;
  isGoogleSynced: boolean;
}

export interface ApiV1Session {
  accessToken: string;
  user: ApiV1User;
}

export interface ApiV1Patient {
  id: number;
  name: string;
  middleName: string | null;
  lastName: string;
  gender?: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  maritalStatus?: string | null;
  occupation?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
  reasonForConsultation?: string | null;
  rfc?: string | null;
  familyMedicalHistory?: Record<string, unknown> | null;
  personalMedicalHistory?: Record<string, unknown> | null;
  email: string | null;
  active: boolean;
  currentBalance: string;
  createdAt: string;
}

export interface ApiV1Appointment {
  id: number;
  patientId: number | null;
  patient: { id: number; name: string; lastName: string } | null;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  status: string;
  reason: string | null;
  note: string | null;
}
