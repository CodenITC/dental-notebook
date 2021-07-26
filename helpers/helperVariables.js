let sqlPatientAndMedicalBackgroundInfo = `SELECT patients.firstname,
  patients.id as patient_id, 
  patients.lastname, 
  patients.phone, 
  patients.email,
  teeth_map.id as teeth_map_id, 
  patients.occupation, 
  patients.birth_date,
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

const sqlTreatmentsTeethMapInfo = `SELECT treatments.name as treatment_name, treatments.id AS treatments_id, teeth_map.patient_id, treatments_teeth.tooth, treatments_teeth.dental_status, treatments_teeth.id AS teeth_treatment_id, treatments_teeth.teeth_map_id AS teeth_map_id
FROM treatments_teeth
JOIN treatments ON treatments_teeth.treatments_id = treatments.id
JOIN teeth_map ON teeth_map.id = treatments_teeth.teeth_map_id`;

const sqlPatientAppointment = `SELECT patients.firstname, patients.lastname, patients.phone, appointments.appointment_date, appointments.id AS appointments_id, patients.id AS patient_id
  FROM patients JOIN appointments ON patients.id = appointments.patient_id`;

const sqlIndividualAppointment = `SELECT patients.firstname, patients.lastname, patients.phone, appointments.appointment_date, appointments.patient_id, appointments.id AS appointments_id
  FROM appointments
  JOIN patients ON patients.id = appointments.patient_id
  WHERE appointments.id = ?`;

const appointedTreatment = `SELECT * FROM appointment_treatments JOIN treatments ON treatments.id = appointment_treatments.treatments_id`;

let sqlEarnings = `SELECT SUM(appointment_treatments.treatment_price) AS total_earnings
                          FROM treatments
                          JOIN appointment_treatments ON treatments.id = appointment_treatments.treatments_id
                          JOIN appointments ON appointments.id = appointment_treatments.appointments_id`;

/* let sqlEarnings = `SELECT SUM(treatments.price) AS total_earnings
                          FROM treatments
                          JOIN appointment_treatments ON treatments.id = appointment_treatments.treatments_id
                          JOIN appointments ON appointments.id = appointment_treatments.appointments_id`; */

let sqlEarningsOrderedByDate = `SELECT treatments.name, appointments.appointment_date, SUM(appointment_treatments.treatment_price) AS treatments_earnings
                                  FROM treatments
                                  JOIN appointment_treatments ON appointment_treatments.treatments_id = treatments.id
                                  JOIN appointments ON appointment_treatments.appointments_id = appointments.id
                                  WHERE appointments.appointment_date < CURRENT_DATE()
                                  GROUP BY appointments.appointment_date, treatments.name
                                  ORDER BY appointments.appointment_date DESC`;

module.exports = {
  sqlPatientAndMedicalBackgroundInfo,
  sqlTreatmentsTeethMapInfo,
  sqlPatientAppointment,
  sqlIndividualAppointment,
  appointedTreatment,
  sqlEarnings,
  sqlEarningsOrderedByDate,
};
