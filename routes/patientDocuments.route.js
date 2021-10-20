const express = require("express");
const fs = require("fs");
const router = express.Router();
const connection = require("../config-db");

const TABLE_NAME = "patient_documents";
const UPLOAD_PATH = "./uploads/";

router.get("/:id", (req, res) => {
  const patientId = req.params.id;

  connection.query(
    `SELECT * FROM ${TABLE_NAME} WHERE patient_id = ${patientId}`,
    (error, results) => {
      if (error) res.status(500).send(error);

      const files = results.map((fileData) => ({
        ...fileData,
        file: fs.readFileSync(fileData.path),
      }));

      res.status(200).json(files);
    }
  );
});

router.post("/", (req, res) => {
  const patient = req.body.patient;
  const files = req.body.files;

  const writeRes = files?.map((file) => {
    const dirPath = `${UPLOAD_PATH}/${patient.firstname}_${patient.patient_id}`;
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    const filePath = `${dirPath}/${file.details.name}`;

    const response = {
      action: fs.existsSync(filePath) ? "UPDATED" : "CREATED",
      path: filePath,
      filename: file.details.name,
      data: {
        patient_id: patient.patient_id,
        path: filePath,
        name: file.details.name,
        size: file.details.size,
        type: file.details.type,
      },
    };

    const buff = Buffer.from(file.data);
    fs.writeFileSync(filePath, buff);

    return response;
  });

  const keys = Object.keys(writeRes[0].data);
  const values = writeRes.map((res) => keys.map((key) => res.data[key]));

  connection.query(
    `INSERT INTO ${TABLE_NAME} (${keys.join(", ")}) VALUES ?`,
    [values],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send(error);
      }
      res.send({ ...writeRes, ...results });
    }
  );
});

router.delete("/:id", (req, res) => {
  const fileId = req.params.id;

  connection.query(
    `SELECT * FROM ${TABLE_NAME} WHERE id = ${fileId}`,
    (error, selectResults) => {
      if (error) res.status(500).send(error);
      const file = selectResults[0];
      file
        ? connection.query(
            `DELETE FROM ${TABLE_NAME} WHERE id = ${file.id}`,
            (error, results) => {
              if (error) res.status(500).send(error);

              console.log(file);

              fs.rmSync(file.path);

              res.send({ ...results, ...file });
            }
          )
        : res.send(file);
    }
  );
});

module.exports = router;
