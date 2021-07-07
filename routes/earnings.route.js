const express = require("express");
const router = express.Router();
const moment = require("moment");
const connection = require("../config-db");
let { sqlEarnings } = require("../helpers/helperVariables");

// GET /earnings
router.get("/", (req, res) => {
  let sqlTotalEarning = (sqlEarnings +=
    " WHERE appointments.appointment_date < CURRENT_DATE()");

  connection.query(sqlTotalEarning, (error, results) => {
    if (error) res.status(500).send(error);
    else {
      if (results.length) res.status(200).json(results[0]);
      else res.status(404).send("Earnings not found");
    }
  });
});

router.get("/last-month", (req, res) => {
  const startDate = moment()
    .month(moment().month() - 1)
    .startOf("month")
    .format("YYYY-MM-DD");
  const endDate = moment()
    .month(moment().month() - 1)
    .endOf("month")
    .format("YYYY-MM-DD");
  let sqlMonthlyEarning = `${sqlEarnings} WHERE appointments.appointment_date >= '${startDate}' AND appointments.appointment_date <= '${endDate}'`;
  console.log(sqlMonthlyEarning);
  connection.query(sqlMonthlyEarning, (error, results) => {
    if (error) res.status(500).send(error);
    else {
      if (results.length) res.status(200).json(results[0]);
      else res.status(404).send("Earnings not found");
    }
  });
});

module.exports = router;

///////create earnings br

// RETRIEVING INFO FROM EARNINGS

// GET request (treatments.price)
// http://localhost:5000/earnings

// GET request by date (treatments.created_at)
// http://localhost:5000/earnings/:date
