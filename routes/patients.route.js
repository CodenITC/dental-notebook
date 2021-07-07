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
let {
  sqlPatientAndMedicalBackgroundInfo,
  sqlTreatmentsTeethMapInfo,
} = require("../helpers/helperVariables");

// GET /patients
router.get("/", (req, res) => {
  connection.query(
    sqlPatientAndMedicalBackgroundInfo.trim(),
    (error, patientResults) => {
      if (error) res.status(500).send(error);
      else {
        if (patientResults.length) {
          connection.query(
            sqlTreatmentsTeethMapInfo.trim(),
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
    }
  );
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
                  else {
                    const sqlNewPatient = `${sqlPatientAndMedicalBackgroundInfo} WHERE patients.id = ?`;
                    connection.query(
                      sqlNewPatient,
                      [newPatientId],
                      (error, newPatientResults) => {
                        if (error) res.status(500).send(error);
                        else res.status(200).send(newPatientResults);
                      }
                    );
                  }
                }
              );
            }
          }
        );
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

  const toBeEditedMedicalBackground = objectKeyFormatter(
    patientObjectTemplateCreator(req, medicalBackgroundObjectTemplate)
  );

  connection.query(
    "SELECT * FROM patients WHERE id = ?",
    [patientId],
    (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        const db = connection.promise();

        const patientFromDb = results[0];

        if (patientFromDb) {
          const queryPromises = [];

          if (Object.keys(toBeEditedPatient).length) {
            const updatePatientsWhereId = db.query(
              "UPDATE patients SET ? WHERE id = ?",
              [toBeEditedPatient, patientId]
            );
            queryPromises.push(updatePatientsWhereId);
          }

          if (Object.keys(toBeEditedMedicalBackground).length) {
            const updateMedicalBackgroundWherePatientId = db.query(
              "UPDATE medical_background SET ? WHERE patient_id = ?",
              [toBeEditedMedicalBackground, patientId]
            );
            queryPromises.push(updateMedicalBackgroundWherePatientId);
          }

          Promise.all(queryPromises).then((values) => {
            const sql =
              sqlPatientAndMedicalBackgroundInfo.trim() +
              " WHERE patients.id = ?";
            connection.query(sql, [patientId], (error, patientResults) => {
              if (error) res.status(500).send(error);
              else {
                if (patientResults.length) {
                  connection.query(
                    sqlTreatmentsTeethMapInfo.trim(),
                    (error, TeethTreatmentResults) => {
                      if (error) res.status(500).send(error);
                      else {
                        for (let i = 0; i < patientResults.length; i++) {
                          patientResults[i].teeth_treatments = [];
                          for (
                            let j = 0;
                            j < TeethTreatmentResults.length;
                            j++
                          ) {
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
                }
              }
            });
          });
        } else {
          res.status(404).send(`Patient with the id ${patientId} not found`);
        }
      }
    }
  );
});

module.exports = router;
