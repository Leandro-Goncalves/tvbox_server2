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
    await prisma.user.update({
      where: {
        guid,
      },
      data: {
        shouldRestart: false,
        lastLogin: dayjs().subtract(1, "day").toISOString(),
      },
    });
    return "reboot";
  }

  if (user.isBlocked) {
    await prisma.user.update({
      where: {
        guid,
      },
      data: {
        lastLogin: dayjs().subtract(1, "day").toISOString(),
      },
    });
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

  if (
    dayjs(new Date()).add(DAYS_TO_WARNING, "day").isAfter(user.expirationDate)
  ) {
    return "warning";
  }

  return "ok";
};
