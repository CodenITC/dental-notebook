const express = require("express");
const router = express.Router();
const connection = require("../config-db");

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

  // JOIN treatments_teeth ON treatments_teeth.teeth_map_id = teeth_map.id
  // JOIN treatments ON treatments_teeth.treatments_id = treatments.id

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
  const {
    firstname,
    lastname,
    phone,
    email,
    occupation,
    age,
    patient_created_at,
    gender,
    has_hbd,
    has_diabetes,
    has_active_medication,
    active_medication,
    has_alergies,
    alergies,
  } = req.body;

  const newPatient = {
    firstname,
    lastname,
    phone,
    email,
    occupation,
    age,
    created_at: patient_created_at,
    gender,
  };

  connection.query(
    "INSERT INTO patients SET ?",
    [newPatient],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const newPatientId = results.insertId;
        const newPatientMedicalBackground = {
          patient_id: newPatientId,
          has_hbd,
          has_diabetes,
          has_active_medication,
          active_medication,
          has_alergies,
          alergies,
        };

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

        //
      }
    }
  );
});

// PUT /patients/:id
router.put("/:id", (req, res) => {
  const patientId = req.params.id;

  const {
    firstname,
    lastname,
    phone,
    email,
    occupation,
    age,
    patient_created_at,
    gender,
    has_hbd,
    has_diabetes,
    has_active_medication,
    active_medication,
    has_alergies,
    alergies,
  } = req.body;

  const toBeEditedPatient = {
    firstname,
    lastname,
    phone,
    email,
    occupation,
    age,
    gender,
  };

  const toBeEditedMedicalBackground = {
    has_hbd,
    has_diabetes,
    has_active_medication,
    active_medication,
    has_alergies,
    alergies,
  };

  connection.query(
    "SELECT * FROM patients WHERE id = ?",
    [patientId],
    (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        const patientFromDb = results[0];
        if (patientFromDb) {
          // const updatedPatient = req.body;
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
                    }
                  }
                );

                // const updatedPatientInfo = {
                //   ...patientFromDb,
                //   ...toBeEditedPatient,
                // };
                // res.status(200).json(updatedPatientInfo);
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
