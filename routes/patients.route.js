const express = require("express");
const { query } = require("../config-db");
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
const {
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

  // console.log(toBeEditedPatient);

  const toBeEditedMedicalBackground = objectKeyFormatter(
    patientObjectTemplateCreator(req, medicalBackgroundObjectTemplate)
  );

  // console.log(toBeEditedMedicalBackground);

  connection.query(
    "SELECT * FROM patients WHERE id = ?",
    [patientId],
    (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        // const { firstname, lastname, phone, email, occupation, age, gender } =
        //   req.body;

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

              // should return medical_background, patient, teeth map, teeth_treatments
              // WHERE patient id is equal to the one we are editing
              // 1. use the sql string inside the get all patients, externalise to a new file for resuability
              // 2. add a where clause to the string to bring back one patient
              // 3. Use the teeth_treatments sql query on the get all patients and do a join on the teeth_map but again adding the where clause by id (think about what id can be used)
              // 4. return the patient object containing medical_background, patient, teeth_treatments
            );
            queryPromises.push(updateMedicalBackgroundWherePatientId);
          }

          // TO DO THE QUERY (SELECT) LIKE IN GET /patients (each) - engrish
          Promise.all(queryPromises).then((values) => console.log(values));
        } else {
          res.status(404).send(`Patient with the id ${patientId} not found`);
        }
      }
    }
  );
});

module.exports = router;
