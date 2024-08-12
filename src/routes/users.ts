import type { Express } from "express";
import { prisma } from "..";
import dayjs from "dayjs";

const UsersRoute = (app: Express) => {
  app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany({
      select: {
        guid: true,
        name: true,
        isBlocked: true,
        expirationDate: true,
        lastLogin: true,
        userApp: {
          select: {
            guid: true,
            name: true,
            startAt: true,
          },
        },
      },
    });
    res.json(
      users.map((user) => ({
        ...user,
        userApp: user.userApp[0],
        isLogged: dayjs(user.lastLogin).isAfter(dayjs().subtract(3, "second")),
      }))
    );
  });

  app.delete("/user/:guid/reboot", async (req, res) => {
    const guid = req.params.guid;

    await prisma.user.update({
      where: {
        guid,
      },
      data: {
        shouldRestart: true,
      },
    });

    return res.json({});
  });

  app.post("/user/:guid/app", async (req, res) => {
    const guid = req.params.guid;
    const { name } = req.body;

    if (!name) {
      await prisma.userApp.deleteMany({
        where: {
          userGuid: guid,
        },
      });
      res.json({});
      return;
    }

    const v = await prisma.userApp.upsert({
      where: {
        userGuid: guid,
      },
      create: {
        name,
        startAt: new Date(),
        userGuid: guid,
      },
      update: {
        name,
        startAt: new Date(),
        userGuid: guid,
      },
    });
    return res.json(v);
  });

  app.delete("/user/:guid", async (req, res) => {
    const guid = req.params.guid;

    await prisma.userApp.deleteMany({
      where: {
        userGuid: guid,
      },
    });

    await prisma.user.delete({
      where: {
        guid: guid,
      },
    });

    return res.json({});
  });

  app.post("/user/:guid/block", async (req, res) => {
    const guid = req.params.guid;
    const isBlocked = req.body.isBlocked === true;

    await prisma.user.update({
      where: {
        guid,
      },
      data: {
        isBlocked,
      },
    });
    res.send("ok");
  });
};

export default UsersRoute;
