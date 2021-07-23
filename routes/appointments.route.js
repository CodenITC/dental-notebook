const express = require("express");
const router = express.Router();
const connection = require("../config-db");
const {
  objectKeyFormatter,
  patientObjectTemplateCreator,
} = require("../helpers/helperFunctions");
const {
  sqlPatientAppointment,
  sqlIndividualAppointment,
  appointedTreatment,
} = require("../helpers/helperVariables");
const { appointmentsObjectTemplate } = require("../helpers/helperObjects");

// GET /appointments
router.get("/", (req, res) => {
  connection.query(sqlPatientAppointment, (error, appointmentsResults) => {
    if (error) res.status(500).send(error);
    else {
      if (appointmentsResults.length) {
        connection.query(appointedTreatment, (error, TreatmentResults) => {
          if (error) res.status(500).send(error);
          else {
            for (let i = 0; i < appointmentsResults.length; i++) {
              appointmentsResults[i].treatments = [];
              for (let j = 0; j < TreatmentResults.length; j++) {
                if (
                  TreatmentResults[j].appointments_id ===
                  appointmentsResults[i].appointments_id
                ) {
                  appointmentsResults[i].treatments.push(TreatmentResults[j]);
                }
              }
            }
            res.status(200).json(appointmentsResults);
          }
        });
      } else res.status(404).send("Appointments not found.");
    }
  });
});

// POST appointments
router.post("/", (req, res) => {
  const newAppointment = objectKeyFormatter(
    patientObjectTemplateCreator(req, appointmentsObjectTemplate)
  );

  connection.query(
    "INSERT INTO appointments SET ?",
    [newAppointment],
    (error, appointmentResults) => {
      if (error) res.status(500).send(error);
      else {
        const newAppointmentId = appointmentResults.insertId;
        const { appointment_treatments } = req.body;
        let appointedTreatment = {};
        const db = connection.promise();

        const queryPromises = [];

        for (let i = 0; i < appointment_treatments.length; i++) {
          appointedTreatment = {
            treatments_id: appointment_treatments[i].treatment_id,
            treatment_price: appointment_treatments[i].treatment_price,
            appointments_id: newAppointmentId,
          };

          const newAppointedTreatment = db.query(
            "INSERT INTO appointment_treatments SET ?",
            [appointedTreatment]
          );

          queryPromises.push(newAppointedTreatment);
        }

        Promise.all(queryPromises)
          .then((result) => {
            connection.query(
              sqlIndividualAppointment,
              [newAppointmentId],
              (error, appointment) => {
                if (error) res.status(500).send(error);
                else {
                  connection.query(
                    `SELECT * FROM appointment_treatments
                                      JOIN treatments ON treatments.id = appointment_treatments.treatments_id
                                      WHERE appointment_treatments.appointments_id = ?`,
                    [newAppointmentId],
                    (err, appointmentTreatments) => {
                      if (err) res.status(500).send(err);
                      else {
                        appointment[0].treatments = appointmentTreatments;
                        res.status(200).json(appointment[0]);
                      }
                    }
                  );
                }
              }
            );
          })
          .catch((error) => res.status(500).send(error));
      }
    }
  );
});

// PUT /appointments/:id
router.put("/:id", (req, res) => {
  const appointmentId = req.params.id;
  const appointmentToEdit = objectKeyFormatter(
    patientObjectTemplateCreator(req, appointmentsObjectTemplate)
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

          if (Object.keys(appointmentToEdit).length) {
            const updateAppointmentWhereId = db.query(
              "UPDATE appointments SET ? WHERE id = ?",
              [appointmentToEdit, appointmentId]
            );
            queryPromises.push(updateAppointmentWhereId);
          }

          if (req.body.treatments.length) {
            db.query(
              "DELETE FROM appointment_treatments WHERE appointments_id = ?",
              [appointmentId]
            ).then(() => {
              const treatmentsArray = req.body.treatments;

              for (let i = 0; i < treatmentsArray.length; i++) {
                let appointmentTreatmentCreator = connection.query(
                  `INSERT INTO appointment_treatments
                                  (appointments_id, treatments_id, treatment_price) VALUES (?, ?, ?)`,
                  [
                    appointmentId,
                    treatmentsArray[i].treatments_id,
                    treatmentsArray[i].treatment_price,
                  ],
                  (err) => err && res.status(500).send(err)
                );
                queryPromises.push(appointmentTreatmentCreator);
              }
            });
          }

          Promise.all(queryPromises).then((values) => {
            connection.query(
              sqlIndividualAppointment,
              [appointmentId],
              (error, appointment) => {
                if (error) res.status(500).send(error);
                else {
                  connection.query(
                    `SELECT * FROM appointment_treatments
                                      JOIN treatments ON treatments.id = appointment_treatments.treatments_id
                                      WHERE appointment_treatments.appointments_id = ?`,
                    [appointmentId],
                    (err, appointmentTreatments) => {
                      if (err) res.status(500).send(err);
                      else {
                        appointment[0].treatments = appointmentTreatments;
                        res.status(200).json(appointment[0]);
                      }
                    }
                  );
                }
              }
            );
          });
        } else
          res.status(404).json({
            errorMessage: `Appointment with id ${appointmentId} not found.`,
          });
      }
    }
  );
});

// DELETE /appointments/:id
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
