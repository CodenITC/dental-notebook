const express = require("express");
const router = express.Router();
const connection = require("../config-db");

// GET /patients
router.get("/", (req, res) => {
  connection.query("SELECT * FROM patients", (error, results) => {
    if (error) res.status(500).send(error);
    else {
      if (results.length) res.status(200).json(results);
      else res.status(404).send("Patients not found.");
    }
  });
});

// GET /patients/:id
router.get("/:id", (req, res) => {
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
});

// POST /patients
router.post("/", (req, res) => {
  const newPatient = req.body;

  connection.query(
    "INSERT INTO patients SET ?",
    [newPatient],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const newPatientId = results.insertId;
        connection.query(
          "SELECT * FROM patients WHERE id=?",
          [newPatientId],
          (error, results) => {
            if (error) res.status(500).send(error);
            else res.status(200).json(results[0]);
          }
        );
      }
    }
  );
});

// PUT /patients/:id
router.put("/:id", (req, res) => {
  const patientId = req.params.id;
  connection.query(
    "SELECT * FROM patients WHERE id = ?",
    [patientId],
    (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        const patientFromDb = results[0];
        if (patientFromDb) {
          const updatedPatient = req.body;
          connection.query(
            "UPDATE patients SET ? WHERE id = ?",
            [updatedPatient, patientId],
            (error) => {
              if (error) {
                res.status(500).send(error);
              } else {
                const updatedPatientInfo = {
                  ...patientFromDb,
                  ...updatedPatient,
                };
                res.status(200).json(updatedPatientInfo);
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
