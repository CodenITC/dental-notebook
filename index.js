const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const connection = require("./config-db");

const todosRouter = require("./routes/todos.route.js");
const patientsRouter = require("./routes/patients.route.js");

connection.connect((error) => {
  if (error) console.log(error);
  else console.log(`connected to database on thread ${connection.threadId}`);
});

app.use(express.json());
app.use("/todos", todosRouter);
app.use("/patients", patientsRouter);

// Appointments START

// Appointments END

/* 
RETRIEVING INFO FROM APPOINTMENTS:

GET request
http://localhost:5000/appointments?date=""


GET request by id
http://localhost:5000/appointments/:id 
*/

app.listen(port, (err) => {
  err ? console.log(err) : console.log(`App is running at port ${port}.`);
});
