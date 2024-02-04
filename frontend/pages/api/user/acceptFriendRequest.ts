import { prisma } from "@/lib/service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const data = req.body.data;


    await prisma.friends.update({
        where: {
            id: data.id
        },
        data: {
            status: "Friends"
        }
    })
    const db = await prisma.friends.findMany({
        select: {
            id: true,
            status: true,
            user1Id: true,
            user2Id: true,
            user1: {
                select: {
                    name: true,
                    image: true,
                    username: true,
                    tag: true
                }
            },
            user2: {
                select: {
                    name: true,
                    image: true,
                    username: true,
                    tag: true
                }
            }
        }
    })
    res.send({
        id: db.map(x => x.id).toString(),
        status: db.map(x => x.status).toString(),
        user1Id: db.map(x => x.user1Id).toString(),
        user2Id: db.map(x => x.user2Id).toString(),
        user1: {
            select: {
                name: db.map(x => x.user1.name).toString(),
                image: db.map(x => x.user1.image).toString(),
                username: db.map(x => x.user1.username).toString(),
                tag: db.map(x => x.user1.tag).toString()
            }
        },
        user2: {
            select: {
                name: db.map(x => x.user2.name).toString(),
                image: db.map(x => x.user2.image).toString(),
                username: db.map(x => x.user2.username).toString(),
                tag: db.map(x => x.user2.tag).toString()
            }
        }
    })
}
