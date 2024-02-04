import { prisma } from "@/lib/service";
import { NextApiRequest, NextApiResponse } from "next";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const data = req.body.data
     await prisma.chats.create({
        data: {
            text: data.message,
            timestamp:data.timestamp,
            conversationId: data.conversationId,
            authorId: data.userId,
            attachment: data.attachment
        }
    })

    return res.send('ok')
}