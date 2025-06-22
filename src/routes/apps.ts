import { prisma } from "..";
import type { Express } from "express";

const AppsRoute = (app: Express) => {
  app.post("/apps/installOrders/:userGuid", async (req, res) => {
    const userGuid = req.params.userGuid;

    const installOrder = await prisma.installOrder.create({
      data: {
        userGuid,
        apps: {
          createMany: {
            data: req.body.apps.map((appGuid: string) => ({
              appGuid,
            })),
          },
        },
      },
    });

    res.json(installOrder);
  });
};

export default AppsRoute;
