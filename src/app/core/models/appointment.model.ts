export class Appointment {
    id: number;
    patient_id: number;
    appointment_date: string;
    appointment_time: string;
    note: string;
    status: string;
  
    constructor(
      id: number,
      patient_id: number,
      appointment_date: string,
      appointment_time: string,
      note: string,
      status: string
    ) {
      this.id = id;
      this.patient_id = patient_id;
      this.appointment_date = appointment_date;
      this.appointment_time = appointment_time;
      this.note = note;
      this.status = status;
    }
  }