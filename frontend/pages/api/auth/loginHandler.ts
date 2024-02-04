import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/service";
import { setCookie } from "cookies-next";
import bcrypt from "bcrypt"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const data = req.body.data
    let userData = await prisma.user.findFirst({
        where: {
            email: data.email,
        },
        select: {
            id: true,
            password: true
        }
    })
    if(!userData) return res.status(400).send('Incorrect Login Info')
    const result = await bcrypt.compare(data.password, userData.password)
    
    if(result) {
            setCookie('loggedIn', 'true', {path: '/', req, res})
            setCookie('accessCode', userData.id, { path: '/',req, res})
            
       return res.status(200).send('loggedIn')
    } 

    

  throw  new Error('Incorrect Login Info')
    
    

}