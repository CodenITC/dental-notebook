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

module.exports = {
  patientObjectTemplate,
  medicalBackgroundObjectTemplate,
};
