const express = require("express");
const router = express.Router();
const connection = require("../config-db");

//GET /treatments:
router.get("/", (req, res) => {
  connection.query("SELECT * FROM treatments", (error, results) => {
    if (error) res.status(500).send(error);
    else {
      if (results.length) res.status(200).json(results);
      else res.status(404).send("Treatment not found.");
    }
  });
});

module.exports = router;

/*
RETRIEVING INFO FROM TREATMENTS:

GET request
http://localhost:5000/treatments

GET request by id
http://localhost:5000/treatments/:id


DELETE TREATMENT FROM TREATMENTS:

DELETE request
http://localhost:5000/treatments/:id


EDIT TREATMENT FROM TREATMENTS:

PUT request
http://localhost:5000/treatments/:id


ADD NEW TREATMENT TO TREATMENTS:

POST request
http://localhost:5000/treatments 
*/
