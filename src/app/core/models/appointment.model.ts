export class Appointment {
    id: number;
    patient_id: number;
    patientFullName!: string;
    appointment_date: string;
    appointment_time: string;
    note: string;
    google_event_id!: string;
    status: string;
  
    constructor(
      id: number,
      patient_id: number,
      appointment_date: string,
      appointment_time: string,
      note: string,
      google_event_id: string,
      status: string
    ) {
      this.id = id;
      this.patient_id = patient_id;
      this.appointment_date = appointment_date;
      this.appointment_time = appointment_time;
      this.google_event_id = google_event_id;
      this.note = note;
      this.status = status;
    }
  }