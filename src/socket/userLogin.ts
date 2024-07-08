import { ISocket } from ".";
import { prisma } from "..";
import dayjs from 'dayjs';

const DAYS_TO_WARNING = 7;

export const UserLogin = async (socket: ISocket, guid: string) => {
    console.log("try to connect =>", guid)

    const user = await prisma.user.findUnique({
        where: {
            guid
        }
    })

    console.log("user", user)

    if (!user) return;
    socket.join(guid);
    socket.data.guid = guid

    if (user.expirationDate < new Date()) {
        socket.emit("expired")
        return;
    }

    await prisma.user.updateMany({
        where: {
            guid,
        },
        data: {
            isLogged: true
        }
    })

    if (dayjs(user.expirationDate).add(DAYS_TO_WARNING, "day").isAfter(new Date)) {

        socket.emit("warning", dayjs(user.expirationDate).diff(new Date, "day"))
        return;
    }
}