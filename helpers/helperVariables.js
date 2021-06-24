const sqlPatientAndMedicalBackgroundInfo = `SELECT patients.firstname,
  patients.id as patient_id, 
  patients.lastname, 
  patients.phone, 
  patients.email, 
  patients.occupation, 
  patients.age,
  patients.created_at,
  patients.gender,
  medical_background.has_hbd,
  medical_background.has_diabetes,
  medical_background.has_active_medication,
  medical_background.active_medication,
  medical_background.has_alergies,
  medical_background.alergies
  FROM patients 
  JOIN medical_background ON medical_background.patient_id = patients.id
  JOIN teeth_map ON teeth_map.patient_id = patients.id`;

const sqlTreatmentsTeethMapInfo = `SELECT treatments.name as treatment_name, teeth_map.patient_id, treatments_teeth.tooth, treatments_teeth.dental_status
FROM treatments_teeth
JOIN treatments ON treatments_teeth.treatments_id = treatments.id
JOIN teeth_map ON teeth_map.id = treatments_teeth.teeth_map_id`;

const sqlPatientAppointment = `SELECT CONCAT(patients.firstname,' ', patients.lastname) as patient_name, appointments.appointment_date 
  FROM patients JOIN appointments ON patients.id = appointments.patient_id`;

const sqlAppointmentsAppointmentTreatments = `SELECT patients.firstname, patients.lastname, patients.phone, appointments.appointment_date, appointments.patient_id, appointment_treatments.treatments_id, appointment_treatments.appointments_id
  FROM appointments
  JOIN patients ON patients.id = appointments.patient_id
  JOIN appointment_treatments ON appointments.id = appointment_treatments.appointments_id
  WHERE appointments.id = ?`;

module.exports = {
  sqlPatientAndMedicalBackgroundInfo,
  sqlTreatmentsTeethMapInfo,
  sqlPatientAppointment,
  sqlAppointmentsAppointmentTreatments,
};
