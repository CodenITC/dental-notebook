const express = require("express");
const router = express.Router();
const connection = require("../config-db");

//post//teeth-treatments
router.post("/", (req, res) => {
  const newTeethTreatments = req.body;
  connection.query(
    "INSERT INTO treatments_teeth SET ?",
    [newTeethTreatments],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const newTeethTreatmentsId = results.insertId;
        connection.query(
          `SELECT treatments_teeth.id AS teeth_treatment_id, treatments_teeth.treatments_id, treatments_teeth.teeth_map_id, treatments_teeth.tooth, treatments_teeth.dental_status, treatments.name AS treatment_name FROM treatments_teeth
              JOIN treatments ON treatments.id = treatments_teeth.treatments_id WHERE treatments_teeth.id = ?`,
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
router.put("/:id", (req, res) => {
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
router.delete("/:id", (req, res) => {
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

module.exports = router;
