import { ISocket } from ".";
import { prisma } from "..";
import dayjs from "dayjs";

const DAYS_TO_WARNING = 7;

export const UserLogin = async (guid: string) => {
  // console.log("try to connect =>", guid);

  const user = await prisma.user.findUnique({
    where: {
      guid,
    },
    // include: {
    //   reboot: true,
    // },
  });

  // console.log("user", user);

  if (!user) return;

  // if (user.reboot.length > 0) {
  //   prisma.reboot.deleteMany({
  //     where: {
  //       userGuid: guid,
  //     },
  //   });
  //   return "reboot";
  // }

  if (user.isBlocked) {
    return "expired";
  }

  if (user.expirationDate < new Date()) {
    return "expired";
  }

  // await prisma.user.updateMany({
  //   where: {
  //     guid,
  //   },
  //   data: {
  //     lastLogin: new Date(),
  //   },
  // });

  await prisma.userApp.deleteMany({
    where: {
      userGuid: guid,
    },
  });

  if (
    dayjs(new Date()).add(DAYS_TO_WARNING, "day").isAfter(user.expirationDate)
  ) {
    return "warning";
  }

  return "ok";
};
