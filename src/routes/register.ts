import type { Express } from "express";
import { crypt } from "../utils/password";
import { prisma } from "..";

const RegisterRoute = (app: Express) => {
  app.post("/register", async (req, res) => {
    const password = await crypt(req.body.password);

    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        password,
      },
      select: {
        guid: true,
        name: true,
      },
    });
    res.json(user);
  });
};

export default RegisterRoute;
