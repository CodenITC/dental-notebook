const patientObjectTemplate = {
  firstname: "",
  lastname: "",
  phone: "",
  email: "",
  occupation: "",
  age: "",
  created_at: "",
  gender: "",
};

const medicalBackgroundObjectTemplate = {
  has_hbd: "",
  has_diabetes: "",
  has_active_medication: "",
  active_medication: "",
  has_alergies: "",
  alergies: "",
};

const appointmentsObjectTemplate = {
  appointment_date: "",
  patient_id: "",
};

const appointmentTreatmentsObjectTemplate = {
  appointment_id: "",
  treatments_id: "",
};

const patientBasicInfosObjectTemplate = {
  firstname: "",
  lastname: "",
  phone: "",
};

module.exports = {
  patientObjectTemplate,
  medicalBackgroundObjectTemplate,
  appointmentsObjectTemplate,
  appointmentTreatmentsObjectTemplate,
  patientBasicInfosObjectTemplate,
};
