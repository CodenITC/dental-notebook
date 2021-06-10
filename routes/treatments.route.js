const express = require("express");
const router = express.Router();
const connection = require("../config-db");

// GET /treatments:
router.get("/", (req, res) => {
  connection.query("SELECT * FROM treatments", (error, results) => {
    if (error) res.status(500).send(error);
    else {
      if (results.length) res.status(200).json(results);
      else res.status(404).send("Treatment not found.");
    }
  });
});

// GET treatments by id
router.get("/:id", (req, res) => {
  const treatmentId = req.params.id;

  connection.query(
    "SELECT * FROM treatments WHERE id = ?",
    [treatmentId],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        if (results.length) res.status(200).json(results);
        else
          res.status(404).send(`Treatment with id ${treatmentId} not found.`);
      }
    }
  );
});
//DELETE request
router.delete("/:id", (req, res) => {
  const treatmentId = req.params.id;
  connection.query(
    "DELETE FROM treatments WHERE id=?",
    [treatmentId],
    (error) => {
      if (error) res.status(500).send(error);
      else res.status(200).send("The treatment was successfully  deleted.");
    }
  );
});

router.put("/:id", (req, res) => {
  const treatmentId = req.params.id;
  connection.query(
    "SELECT * FROM treatments WHERE id=?",
    [treatmentId],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const treatmentFromDb = results[0];
        if (treatmentFromDb) {
          const updatedTreatment = req.body;
          connection.query(
            "UPDATE treatments SET ? WHERE id = ?",
            [updatedTreatment, treatmentId],
            (error) => {
              if (error) {
                res.status(500).send(error);
              } else {
                const updatedTreatmentInfo = {
                  ...treatmentFromDb,
                  ...updatedTreatment,
                };
                res.status(200).json(updatedTreatmentInfo);
              }
            }
          );
        } else {
          res
            .status(404)
            .send(`Treatment with the id ${treatmentId} not found`);
        }
      }
    }
  );
});

router.post("/", (req, res) => {
  const newTreatment = req.body;
  connection.query(
    "INSERT INTO treatments SET ?",
    [newTreatment],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const newTreatmentId = results.insertId;
        connection.query(
          "SELECT * FROM treatments WHERE id = ?",
          [newTreatmentId],
          (error, results) => {
            if (error) res.status(500).send(error);
            else res.status(200).json(results[0]);
          }
        );
      }
    }
  );
});

module.exports = router;

/*

EDIT TREATMENT FROM TREATMENTS:

PUT request
http://localhost:5000/treatments/:id


ADD NEW TREATMENT TO TREATMENTS:

POST request
http://localhost:5000/treatments 
*/
