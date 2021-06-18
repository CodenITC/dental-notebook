const express = require("express");
const router = express.Router();
const connection = require("../config-db");
const {
  objectKeyFormatter,
  patientObjectTemplateCreator,
} = require("../helpers/helperFunctions");
const {
  patientObjectTemplate,
  medicalBackgroundObjectTemplate,
} = require("../helpers/helperObjects");

// GET /patients
router.get("/", (req, res) => {
  const sql = `SELECT patients.firstname,
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

  connection.query(sql.trim(), (error, patientResults) => {
    if (error) res.status(500).send(error);
    else {
      if (patientResults.length) {
        connection.query(
          "SELECT treatments.name as treatment_name, teeth_map.patient_id, treatments_teeth.tooth, treatments_teeth.dental_status FROM treatments_teeth JOIN treatments ON treatments_teeth.treatments_id = treatments.id JOIN teeth_map ON teeth_map.id = treatments_teeth.teeth_map_id",
          (error, TeethTreatmentResults) => {
            if (error) res.status(500).send(error);
            else {
              for (let i = 0; i < patientResults.length; i++) {
                patientResults[i].teeth_treatments = [];
                for (let j = 0; j < TeethTreatmentResults.length; j++) {
                  if (
                    TeethTreatmentResults[j].patient_id ===
                    patientResults[i].patient_id
                  ) {
                    patientResults[i].teeth_treatments.push(
                      TeethTreatmentResults[j]
                    );
                  }
                }
              }
              res.status(200).send(patientResults);
            }
          }
        );
      } else res.status(404).send("Patients not found.");
    }
  });
});

// GET /patients/:id
/* router.get("/:id", (req, res) => {
  const patientId = req.params.id;

  connection.query(
    "SELECT * FROM patients WHERE id = ?",
    [patientId],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        if (results.length) res.status(200).json(results);
        else res.status(404).send(`Patient with id ${patientId} not found.`);
      }
    }
  );
}); */

// POST /patients
router.post("/", (req, res) => {
  const newPatient = objectKeyFormatter(
    patientObjectTemplateCreator(req, patientObjectTemplate)
  );

  console.log(newPatient);

  connection.query(
    "INSERT INTO patients SET ?",
    [newPatient],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const newPatientId = results.insertId;
        const newPatientMedicalBackground = objectKeyFormatter(
          patientObjectTemplateCreator(req, medicalBackgroundObjectTemplate)
        );
        newPatientMedicalBackground.patient_id = newPatientId;

        connection.query(
          `INSERT INTO medical_background SET ?;`,
          [newPatientMedicalBackground],
          (error, results) => {
            if (error) res.status(500).send(error);
            else {
              const newPatientTeethMap = {
                patient_id: newPatientId,
              };
              connection.query(
                "INSERT INTO teeth_map SET ?",
                [newPatientTeethMap],
                (error, results) => {
                  if (error) res.status(500).send(error);
                  else res.status(200).json(results);
                }
              );
            }
          }
        );
      }
    }
  );
});

//post//teeth-treatments
router.post("/teeth-treatments", (req, res) => {
  const newTeethTreatments = req.body;
  connection.query(
    "INSERT INTO treatments_teeth SET ?",
    [newTeethTreatments],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const newTeethTreatmentsId = results.insertId;
        connection.query(
          "SELECT * FROM treatments_teeth WHERE id = ?",
          [newTeethTreatmentsId],
          (error, results) => {
            if (error) res.status(500).send(error);
            else res.status(200).json(results[0]);
          }
        );
      }
    }
  );
});

// PUT /patients/teeth-treatments/:id
router.put("/teeth-treatments/:id", (req, res) => {
  const teethTreatmentsId = req.params.id;

  connection.query(
    "SELECT * FROM treatments_teeth WHERE id = ?",
    [teethTreatmentsId],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const teethTreatmentsFromDb = results[0];

        if (teethTreatmentsFromDb) {
          const updatedTeethTreatments = req.body;

          connection.query(
            "UPDATE treatments_teeth SET ? WHERE id = ?",
            [updatedTeethTreatments, teethTreatmentsId],
            (error) => {
              if (error) {
                res.status(500).send(error);
              } else {
                const updatedTeethTreatmentsInfo = {
                  ...teethTreatmentsFromDb,
                  ...updatedTeethTreatments,
                };
                res.status(200).json(updatedTeethTreatmentsInfo);
              }
            }
          );
        } else {
          res
            .status(404)
            .send(
              `Teeth Treatment with the id ${teethTreatmentsId} not found.`
            );
        }
      }
    }
  );
});

// DELETE /patients/teeth-treatments/:id
router.delete("/teeth-treatments/:id", (req, res) => {
  const teethTreatmentsId = req.params.id;

  connection.query(
    "SELECT * FROM treatments_teeth WHERE id = ?",
    [teethTreatmentsId],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const teethTreatmentsFromDb = results[0];
        if (teethTreatmentsFromDb) {
          connection.query(
            "DELETE FROM treatments_teeth WHERE id = ?",
            [teethTreatmentsId],
            (error, results) => {
              if (error) res.status(500).send(error);
              else {
                res
                  .status(200)
                  .send(`The teeth treatment was successfully deleted`);
              }
            }
          );
        } else {
          res
            .status(404)
            .send(
              `The teeth treatment with the id ${teethTreatmentsId} was not found`
            );
        }
      }
    }
  );
});

// PUT /patients/:id
router.put("/:id", (req, res) => {
  const patientId = req.params.id;

  const toBeEditedPatient = objectKeyFormatter(
    patientObjectTemplateCreator(req, patientObjectTemplate)
  );

  console.log(toBeEditedPatient);

  const toBeEditedMedicalBackground = objectKeyFormatter(
    patientObjectTemplateCreator(req, medicalBackgroundObjectTemplate)
  );

  console.log(toBeEditedMedicalBackground);

  connection.query(
    "SELECT * FROM patients WHERE id = ?",
    [patientId],
    (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        const patientFromDb = results[0];
        if (patientFromDb) {
          connection.query(
            "UPDATE patients SET ? WHERE id = ?",
            [toBeEditedPatient, patientId],
            (error) => {
              if (error) {
                res.status(500).send(error);
              } else {
                connection.query(
                  "UPDATE medical_background SET ? WHERE patient_id = ?",
                  [toBeEditedMedicalBackground, patientId],
                  (error) => {
                    if (error) {
                      res.status(500).send(error);
                    } else {
                      /// todo

                      const updatedPatientInfo = {
                        ...patientFromDb,
                        ...toBeEditedPatient,
                      };
                      res.status(200).json(updatedPatientInfo);
                    }
                  }
                );
              }
            }
          );
        } else {
          res.status(404).send(`Patient with the id ${patientId} not found`);
        }
      }
    }
  );
});

module.exports = router;
