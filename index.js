const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const connection = require("./config-db");

const todosRouter = require("./routes/todos.route.js");
const patientsRouter = require("./routes/patients.route.js");
const patientsDocumentsRouter = require("./routes/patientDocuments.route.js");
const treatmentsRouter = require("./routes/treatments.route.js");
const earningsRouter = require("./routes/earnings.route.js");
const teethTreatmentsRouter = require("./routes/patientTreatments.route.js");
const appointmentsRouter = require("./routes/appointments.route.js");

connection.connect((error) => {
  if (error) console.log(error);
  else console.log(`connected to database on thread ${connection.threadId}`);
});

// 194.13.82.114:5000

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/todos", todosRouter);
app.use("/patients", patientsRouter);
app.use("/treatments", treatmentsRouter);
app.use("/earnings", earningsRouter);
app.use("/patients/treatments", teethTreatmentsRouter);
app.use("/patients/documents", patientsDocumentsRouter);
app.use("/appointments", appointmentsRouter);

app.listen(port, (err) => {
  err ? console.log(err) : console.log(`App is running at port ${port}.`);
});
