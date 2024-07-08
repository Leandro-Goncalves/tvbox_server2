import type { Express } from "express";
import { Io } from "../socket";

const RebootRoute = (io: Io, app: Express) => {
  app.post("/reboot", async (req, res) => {
    io.to(req.body.guid).emit("reboot");
    res.send("ok");
  });
};

export default RebootRoute;
