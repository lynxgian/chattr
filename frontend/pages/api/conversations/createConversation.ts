import { prisma } from "@/lib/service";
import { Conversations, User } from "@prisma/client/edge";
import { NextApiRequest, NextApiResponse } from "next";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let users = [];
    const data = req.body.data

    for (const user of data.users) {
        const tag = user.split('#')[1]
         const db = await prisma.user.findFirst({
            where: {
                tag: tag
            },
            select: {
                id: true
            }
        })
        users.push(db.id)
    } 
    const test = users.map((x) => ({id: x}))
    
    const db = await prisma.conversations.create({
        data: {
           name: data.name,
           users: {
             connect:  test
           }
        
        },
        select: {
            id: true,
            name: true,
            users: true,
            chats: true
        }
    }) 
    return res.send({
       conversation: db.id,
       name: db.name,
       users: db.users,
       chats: db.chats
    })
}