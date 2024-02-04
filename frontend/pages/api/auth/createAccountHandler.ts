import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/service";
import { setCookie } from "cookies-next";
import bcrypt from "bcrypt"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const fourDigitInteger = Math.floor(1000 + Math.random() * 9000);

    const data = req.body.data
    const saltedPassword = await bcrypt.hash(data.password, 10)
    const findUserEmail = await prisma.user.findFirst({
        where: {
            email: data.email,
        }
    })

    if(findUserEmail) {
        
        throw new Error('Email has been used already')
    }


    const userData = await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: saltedPassword,
            name: data.name,
            tag: `${fourDigitInteger}`
        },
        select: {
            id: true
        }
    })
        setCookie('loggedIn', 'true', {path: '/', req, res})
        setCookie('accessCode', userData.id, { path: '/',req, res})
    return res.status(200).send('Success')
}