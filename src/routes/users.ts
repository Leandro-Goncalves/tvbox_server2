import type { Express } from "express";
import { prisma } from "..";
import dayjs from "dayjs";

const appNames: Record<string, string> = {
  "com.droidlogic.mboxlauncher": "Launcher",
  "com.leandro_goncalves.tvbox": "Launcher LG",
  "com.global.unitviptv": "UniTV",
  "com.integration.unitvsiptv": "UniTV Free",
  "com.google.android.youtube.tv": "Youtube",
  "com.mm.droid.livetv.tve": "TV Express",
  "com.mm.droid.livetv": "Mibo IA",
  "com.tv.visioncine": "Vision Cine",
  "com.newbraz.p2p": "P2Braz",
};

export const handleAction = async (guid: string) => {
  const user = await prisma.user.findUnique({
    where: {
      guid,
    },
  });
  if (!user) {
    return {};
  }
};

export const updateName = async (guid: string, n: string) => {
  const name = appNames[n] || n;

  const appName = await prisma.userApp.findUnique({
    where: {
      userGuid: guid,
    },
    select: {
      name: true,
    },
  });

  if (name === "Launcher LG") {
    await prisma.userApp.deleteMany({
      where: {
        userGuid: guid,
      },
    });
    return {};
  }

  if (appName?.name === name) {
    return {};
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

  return v;
};

export const updateVersion = async (guid: string, appVersion: string) => {
  const v = await prisma.user.update({
    where: {
      guid,
    },
    data: {
      appVersion,
    },
  });

  return v;
};

const UsersRoute = (app: Express) => {
  app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany({
      select: {
        guid: true,
        name: true,
        isBlocked: true,
        expirationDate: true,
        lastLogin: true,
        appVersion: true,
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
        isLogged: dayjs(user.lastLogin).isAfter(dayjs().subtract(30, "second")),
      }))
    );
  });

  app.get("/user/:guid", async (req, res) => {
    const users = await prisma.user.findUnique({
      where: {
        guid: req.params.guid,
      },
      select: {
        guid: true,
        name: true,
        expirationDate: true,
        lastLogin: true,
        appVersion: true,
        installOrders: {
          include: {
            apps: {
              include: {
                app: true,
              },
            },
          },
        },
      },
    });
    if (!users) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(users);
  });

  app.post("/user/:guid/reboot", async (req, res) => {
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
    return res.json({});
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
