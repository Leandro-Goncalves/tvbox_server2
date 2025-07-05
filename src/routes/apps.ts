import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma, s3 } from "..";
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
  app.delete("/apps/installOrders/:guid", async (req, res) => {
    const guid = req.params.guid;

    const installOrder = await prisma.installOrder.delete({
      where: { guid },
    });

    res.json(installOrder);
  });

  app.get("/apps", async (req, res) => {
    return prisma.apps.findMany().then((apps) => res.json(apps));
  });

  app.get("/apps/:guid", async (req, res) => {
    const guid = req.params.guid;
    const appData = await prisma.apps.findUnique({
      where: { guid },
    });
    if (!appData) {
      return res.status(404).json({ error: "App not found" });
    }
    res.json(appData);
  });

  app.delete("/apps/:guid/:key", async (req, res) => {
    const guid = req.params.guid;
    const key = req.params.key;

    s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      })
    );

    const appData = await prisma.apps.delete({
      where: { guid },
    });

    // delete when apps inside installOrder is empty
    await prisma.installOrder.deleteMany({
      where: { apps: { none: {} } },
    });

    res.json(appData);
  });

  app.put("/apps/:guid", async (req, res) => {
    const guid = req.params.guid;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name must be provided" });
    }

    const updatedApp = await prisma.apps.update({
      where: { guid },
      data: {
        name,
      },
    });

    res.json(updatedApp);
  });
};

export default AppsRoute;
