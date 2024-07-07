import express from "express";
import LoginRoute from "./routes/login";
import { PrismaClient } from "@prisma/client";

const PORT = 3023;

export const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

LoginRoute(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
