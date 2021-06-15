const express = require("express");
const router = express.Router();
const connection = require("../config-db");

// GET /earnings
router.get("/", (req, res) => {
  connection.query("SELECT price FROM treatments", (error, results) => {
    if (error) res.status(500).send(error);
    else {
      if (results.length) res.status(200).json(results);
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
