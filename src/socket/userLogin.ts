import { ISocket } from ".";
import { prisma } from "..";
import dayjs from "dayjs";

const DAYS_TO_WARNING = 7;

export const UserLogin = async (guid: string) => {
  const user = await prisma.user.findUnique({
    where: {
      guid,
    },
  });

  if (!user) return;

  if (user.shouldRestart) {
    prisma.user.update({
      where: {
        guid,
      },
      data: {
        shouldRestart: false,
      },
    });
    return "reboot";
  }

  if (user.isBlocked) {
    return "expired";
  }

  if (user.expirationDate < new Date()) {
    return "expired";
  }

  await prisma.user.updateMany({
    where: {
      guid,
    },
    data: {
      lastLogin: new Date(),
    },
  });

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
