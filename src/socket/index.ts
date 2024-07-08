import dayjs from "dayjs";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { prisma } from "..";
import { UserLogin } from "./userLogin";

export type Io = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;
export type ISocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export const startSocket = (io: Io) => {
  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("user", async (guid) => {
      await UserLogin(socket, guid);
      socket.on("removeApp", async function () {
        console.log("user remove app");
        await prisma.userApp.deleteMany({
          where: {
            userGuid: guid,
          },
        });
      });

      socket.on("openApp", async function (name: string) {
        console.log("user update", name);
        await prisma.userApp.upsert({
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
      });
    });

    socket.on("disconnect", async function () {
      console.log("disconnect", socket.data.guid);

      if (!socket.data.guid) {
        console.log("user not found");
        return;
      }
      await prisma.user.updateMany({
        where: {
          guid: socket.data.guid,
        },
        data: {
          isLogged: false,
        },
      });

      await prisma.userApp.deleteMany({
        where: {
          userGuid: socket.data.guid,
        },
      });
    });
  });
};
