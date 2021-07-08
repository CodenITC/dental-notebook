const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const connection = require("./config-db");

const todosRouter = require("./routes/todos.route.js");
const patientsRouter = require("./routes/patients.route.js");
const treatmentsRouter = require("./routes/treatments.route.js");
const earningsRouter = require("./routes/earnings.route.js");
const teethTreatmentsRouter = require("./routes/teethTreatments.route.js");
const appointmentsRouter = require("./routes/appointments.route.js");

connection.connect((error) => {
  if (error) console.log(error);
  else console.log(`connected to database on thread ${connection.threadId}`);
});

app.use(express.json());
app.use("/todos", todosRouter);
app.use("/patients", patientsRouter);
app.use("/treatments", treatmentsRouter);
app.use("/earnings", earningsRouter);
app.use("/patients/teeth-treatments", teethTreatmentsRouter);
app.use("/appointments", appointmentsRouter);

app.listen(port, (err) => {
  err ? console.log(err) : console.log(`App is running at port ${port}.`);
});
