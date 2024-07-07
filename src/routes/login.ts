import { prisma } from "..";
import { compare } from "../utils/password";
import jwt from "jsonwebtoken";
import type { Express } from "express";

enum Rules {
  user = "user",
  admin = "admin",
}

const LoginRoute = (app: Express) => {
  app.post("/login", async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;

    console.log("login", name, password);

    const user = await prisma.user.findUnique({
      where: {
        name,
      },
      select: {
        guid: true,
        name: true,
        password: true,
      },
    });

    console.log(user);

    if (!user) {
      return res.json({
        error: "Usuario não encontrado",
      });
    }

    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.json({
        error: "Usuario não encontrado",
      });
    }

    const token = jwt.sign(
      { rules: [Rules.user] },
      process.env.JWT_SECRET ?? ""
    );

    res.json({ name: user.name, guid: user.guid, token });
  });
};

export default LoginRoute;
