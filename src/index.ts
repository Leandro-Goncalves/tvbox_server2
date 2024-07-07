import express from "express";

const app = express();
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3023, () => {
  console.log("Server started on port 3023");
});
