import { prisma } from "@/lib/service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const data = req.body.data;

    await prisma.user.update({
        where: {
            id: data.userId,
            
        },
        data: {
            username: data.username
        }
    })
}
