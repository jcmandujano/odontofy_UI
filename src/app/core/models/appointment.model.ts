export class Appointment {
    id: number;
    patient_id: number;
    patientFullName!: string;
    appointment_datetime!: string;
    appointment_end_datetime!: string;
    note: string;
    reason: string;
    google_event_id!: string;
    status: string;
  
    constructor(
      id: number,
      patient_id: number,
      apppointment_datetime: string,
      appointment_end_datetime: string,
      note: string,
      reason: string,
      google_event_id: string,
      status: string
    ) {
      this.id = id;
      this.patient_id = patient_id;
      this.appointment_datetime = apppointment_datetime;
      this.appointment_end_datetime = appointment_end_datetime;
      this.google_event_id = google_event_id;
      this.note = note;
      this.reason = reason;
      this.status = status;
    }
  }