import type { Express } from "express";
import { prisma } from "..";
import dayjs from "dayjs";

const ExpireRoute = (app: Express) => {
  app.post("/user/:guid/expire/month", async (req, res) => {
    const guid = req.params.guid;

    const month = req.body.month;

    const user = await prisma.user.findUnique({
      where: {
        guid,
      },
    });

    if (!user) {
      return res.json({});
    }

    await prisma.user.update({
      where: {
        guid,
      },
      data: {
        expirationDate: dayjs(user.expirationDate)
          .add(month, "month")
          .toISOString(),
      },
    });
    return res.json({});
  });

  app.post("/user/:guid/expire/day", async (req, res) => {
    const guid = req.params.guid;

    const days = req.body.days;

    const user = await prisma.user.findUnique({
      where: {
        guid,
      },
    });

    if (!user) {
      return res.json({});
    }

    await prisma.user.update({
      where: {
        guid,
      },
      data: {
        expirationDate: dayjs(user.expirationDate)
          .add(days, "day")
          .toISOString(),
      },
    });
    return res.json({});
  });
};

export default ExpireRoute;
