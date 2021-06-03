const express = require("express");
const app = express();
require("dotenv").config;
const port = process.env.PORT || 5000;

app.listen(port, (err) => {
  err ? console.log(err) : console.log(`App is running at port ${port}.`);
});
