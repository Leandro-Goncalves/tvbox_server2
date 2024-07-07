import express from "express";
import { PrismaClient } from "@prisma/client";
import LoginRoute from "./routes/login";
import RegisterRoute from "./routes/register";
import UsersRoute from "./routes/users";
import ExpireRoute from "./routes/expire";

const PORT = 3023;

export const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

LoginRoute(app);
RegisterRoute(app);
UsersRoute(app);
ExpireRoute(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
