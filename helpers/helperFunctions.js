// Takes in an object and removes all undefined values
const objectKeyFormatter = (object) => {
  Object.keys(object).forEach(
    (key) => object[key] === undefined && delete object[key]
  );
  return object;
};

// Merge req.body and objectTemplate to create an object which contains keys and values
// e.g patientObjectTemplate will return an object with all the values for the patient table
const patientObjectTemplateCreator = (req, objectTemplate) => {
  const finalObject = {};

  Object.keys(req.body).forEach((key) => {
    objectTemplate.hasOwnProperty(key) && (finalObject[key] = req.body[key]);
  });

  return finalObject;
};

module.exports = {
  objectKeyFormatter,
  patientObjectTemplateCreator,
};
