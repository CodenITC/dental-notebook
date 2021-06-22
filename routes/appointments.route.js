const express = require("express");
const router = express.Router();
const connection = require("../config-db");
const { sqlPatientAppointment } = require("../helpers/helperVariables");

// GET /appointments
router.get("/", (req, res) => {
  connection.query(sqlPatientAppointment, (error, results) => {
    if (error) res.status(500).send(error);
    else {
      if (results.length) res.status(200).json(results);
      else res.status(404).send("Appointments not found.");
    }
  });
});

// POST appointments
router.post("/", (req, res) => {
  const newAppointment = req.body;

  connection.query(
    "INSERT INTO appointments SET ?",
    [newAppointment],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const newAppointmentId = results.insertId;
        connection.query();
      }
    }
  );
});

module.exports = router;
