const express = require("express");
const router = express.Router();
const moment = require("moment");
const connection = require("../config-db");
const {
  sqlEarnings,
  sqlEarningsOrderedByDate,
} = require("../helpers/helperVariables");

// GET /earnings
router.get("/", (req, res) => {
  let sqlTotalEarning = `${sqlEarnings} WHERE appointments.appointment_date < CURRENT_DATE()`;

  connection.query(sqlTotalEarning, (error, results) => {
    if (error) res.status(500).send(error);
    else {
      if (results.length) res.status(200).json(results[0]);
      else res.status(404).send("Earnings not found");
    }
  });
});

// GET /earnings/last-month
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

// GET /earnings/earnings-by-date
router.get("/earnings-by-date", (req, res) => {
  connection.query(sqlEarningsOrderedByDate, (error, earningsByDateResults) => {
    if (error) res.status(500).send(error);
    else {
      if (earningsByDateResults.length)
        res.status(200).json(earningsByDateResults);
      else res.status(404).send("Earnings not found");
    }
  });
});

module.exports = router;
