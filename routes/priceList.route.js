const express = require("express");
const router = express.Router();
const connection = require("../config-db");

////GET pricelist

router.get("/", (req, res) => {
  connection.query("SELECT * FROM treatments", (err, treatmentsResults) => {
    if (err) res.status(500).json(err);
    else res.status(200).json(treatmentsResults);
  });
});

// POST /price-list
router.post("/", (req, res) => {
  const newTreatmentPrice = req.body;
  connection.query(
    "INSERT INTO treatments SET ?",
    [newTreatmentPrice],
    (err, newTreatmentsResults) => {
      if (err) res.status(500).json(err);
      else {
        const newTreatmentPriceId = newTreatmentsResults.insertId;
        connection.query(
          "SELECT * FROM treatments WHERE id = ?",
          [newTreatmentPriceId],
          (err, newTreatmentPriceIdResults) => {
            if (err) res.status(500).json(err);
            else res.status(200).json(newTreatmentPriceIdResults);
          }
        );
      }
    }
  );
});

module.exports = router;
