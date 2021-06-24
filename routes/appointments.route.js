const express = require("express");
const router = express.Router();
const connection = require("../config-db");
const {
  objectKeyFormatter,
  patientObjectTemplateCreator,
} = require("../helpers/helperFunctions");
const {
  sqlPatientAppointment,
  sqlAppointmentsAppointmentTreatments,
} = require("../helpers/helperVariables");
const {
  appointmentsObjectTemplate,
  appointmentTreatmentsObjectTemplate,
  patientBasicInfosObjectTemplate,
} = require("../helpers/helperObjects");

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

// POST appointments TO BE JUDGED
router.post("/", (req, res) => {
  const newAppointment = objectKeyFormatter(
    patientObjectTemplateCreator(req, appointmentsObjectTemplate)
  );

  // should remove it
  const newAppointmentTreatment = objectKeyFormatter(
    patientObjectTemplateCreator(req, appointmentTreatmentsObjectTemplate)
  );

  connection.query(
    "INSERT INTO appointments SET ?",
    [newAppointment],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const newAppointmentId = results.insertId;

        // do map here from array that comes from front end

        const appointedTreatment = {
          ...newAppointmentTreatment,
          appointments_id: newAppointmentId,
        };
        connection.query(
          "INSERT INTO appointment_treatments SET ?",
          [appointedTreatment],
          (error, results) => {
            if (error) res.status(500).send(error);
            else {
              connection.query(
                sqlAppointmentsAppointmentTreatments,
                [newAppointmentId],
                (error, results) => {
                  if (error) res.status(500).send(error);
                  else res.status(200).json(results[0]);
                }
              );
            }
          }
        );
      }
    }
  );
});

// PUT /appointments/:id TO BE JUDGED
router.put("/:id", (req, res) => {
  const appointmentId = req.params.id;
  const appointmentToEdit = objectKeyFormatter(
    patientObjectTemplateCreator(req, appointmentsObjectTemplate)
  );

  const apointmentTreatmentsToEdit = objectKeyFormatter(
    patientObjectTemplateCreator(req, appointmentTreatmentsObjectTemplate)
  );

  const patientBasicInfosToEdit = objectKeyFormatter(
    patientObjectTemplateCreator(req, patientBasicInfosObjectTemplate)
  );

  connection.query(
    "SELECT * FROM appointments WHERE id = ?",
    [appointmentId],
    (error, results) => {
      if (error) res.status(500).send(error);
      else {
        const db = connection.promise();
        const appointmentFromDb = results[0];

        if (appointmentFromDb) {
          const queryPromises = [];
          const patientId = req.body.patient_id;

          if (Object.keys(patientBasicInfosToEdit).length) {
            const updatePatientBasicInfosWhereId = db.query(
              "UPDATE patients SET ? WHERE id = ?",
              [patientBasicInfosToEdit, patientId]
            );
            queryPromises.push(updatePatientBasicInfosWhereId);
          }

          if (Object.keys(appointmentToEdit).length) {
            const updateAppointmentWhereId = db.query(
              "UPDATE appointments SET ? WHERE id = ?",
              [appointmentToEdit, appointmentId]
            );
            queryPromises.push(updateAppointmentWhereId);
          }

          if (Object.keys(apointmentTreatmentsToEdit).length) {
            const updateApointmentTreatmentsWhereId = db.query(
              "UPDATE appointment_treatments SET ? WHERE appointments_id = ?",
              [apointmentTreatmentsToEdit, appointmentId]
            );
            queryPromises.push(updateApointmentTreatmentsWhereId);
          }

          Promise.all(queryPromises).then((values) => {
            connection.query(
              sqlAppointmentsAppointmentTreatments,
              [appointmentId],
              (error, results) => {
                if (error) res.status(500).send(error);
                else res.status(200).json(results);
              }
            );
          });
        }
      }
    }
  );
});

// DELETE /appointments/:id TO BE JUDGED
router.delete("/:id", (req, res) => {
  const appointmentId = req.params.id;
  connection.query(
    "DELETE FROM appointments WHERE id = ?",
    [appointmentId],
    (error) => {
      if (error) res.status(500).send(error);
      else res.status(200).send("Appointment Deleted");
    }
  );
});

module.exports = router;
