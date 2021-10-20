const express = require("express");
const router = express.Router();
const connection = require("../config-db");

// GET /todos
router.get("/", (_req, res) => {
  connection.query("SELECT * FROM todos", (error, results) => {
    if (error) res.status(500).send(error);
    res.status(200).json(results);
  });
});

// POST /todos
router.post("/", (req, res) => {
  const newTodos = req.body;
  console.log(newTodos);
  console.log("INSERT INTO todos SET ?", [newTodos]);
  connection.query("INSERT INTO todos SET ?", [newTodos], (error, results) => {
    if (error) res.status(500).send(error);
    else {
      const newTodoId = results.insertId;
      connection.query(
        "SELECT * FROM todos WHERE id = ?",
        [newTodoId],
        (error, results) => {
          if (error) res.status(500).send(error);
          else res.status(200).json(results[0]);
        }
      );
    }
  });
});

// DELETE /todos/:id
router.delete("/:id", (req, res) => {
  const todosId = req.params.id;

  connection.query("DELETE FROM todos WHERE id = ?", [todosId], (error) => {
    if (error) res.status(500).send(error);
    else res.status(200).send("The todo was successfully deleted");
  });
});

module.exports = router;
