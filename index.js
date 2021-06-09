const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const connection = require("./config-db");

connection.connect((error) => {
  if (error) console.log(error);
  else console.log(`connected to database on thread ${connection.threadId}`);
});

app.use(express.json());

app.get("/todos", (req, res) => {
  connection.query("SELECT * FROM todos", (error, results) => {
    if (error) res.status(500).send(error);
    else {
      if (results.length) res.status(200).json(results);
      else res.status(404).send("Todos not found.");
    }
  });
});

app.post("/todos", (req, res) => {
  const newTodos = req.body;
  connection.query("INSERT INTO todos SET ?", [newTodos], (error, results) => {
    if (error) response.status(500).send(error);
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

app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  connection.query("DELETE FROM todos WHERE id = ?", [id], (error, results) => {
    if (error) res.status(500).send(error);
    else res.send("The todo was successfully deleted");
  });
});

// RETRIEVING INFO FROM TODOS:

// GET request (todos.todo_item)
// http://localhost:5000/todos

// ADD NEW INFO TO TODOS:

// POST request
// http://localhost:5000/todos

// DELETE INFO FROM TODOS:

// DELETE request
// http://localhost:5000/todos/:id

app.listen(port, (err) => {
  err ? console.log(err) : console.log(`App is running at port ${port}.`);
});
