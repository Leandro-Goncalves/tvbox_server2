import express from "express";
import http from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import LoginRoute from "./routes/login";
import RegisterRoute from "./routes/register";
import UsersRoute from "./routes/users";
import ExpireRoute from "./routes/expire";
import { UserLogin } from "./socket/userLogin";

const PORT = 3023;

export const prisma = new PrismaClient();
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

LoginRoute(app);
RegisterRoute(app);
UsersRoute(app);
ExpireRoute(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/status", async (req, res) => {
  const status = await UserLogin(req.body.guid);
  return res.json({ status });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
