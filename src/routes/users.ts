import type { Express } from "express";
import { prisma } from "..";
import { Io } from "../socket";

const UsersRoute = (io: Io, app: Express) => {
  app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany({
      select: {
        guid: true,
        name: true,
        isLogged: true,
        isBlocked: true,
        expirationDate: true,
        userApp: {
          select: {
            guid: true,
            name: true,
            startAt: true,
          },
        },
      },
    });
    res.json(users.map((user) => ({ ...user, userApp: user.userApp[0] })));
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
    if (isBlocked) {
      io.to(guid).emit("reboot");
    }
    res.send("ok");
  });
};

export default UsersRoute;
