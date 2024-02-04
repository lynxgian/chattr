import { prisma } from "@/lib/service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body.data;
  const user = await prisma.user.findFirst({
    where: {
        username: data.username,
        tag: data.tag,
        },
        select: {
            id: true
        }
    
  })
  

  if(!user) {
    return res.status(202).send("User not found");

  }
  const findFriend = await prisma.friends.findFirst({
    where: {
      user1Id: data.currentUser,
      user2Id: user.id
    }
  })
  if(findFriend) {
    return res.status(203).send('Friendship already exists')
  }
   await prisma.friends.create({
    data: {
        user1Id: data.currentUser,
        user2Id: user.id,
        status: "Pending"
    }
  })

  const db = await prisma.user.findFirst({
    where: {
      id: data.currentUser,
    },
    select: {
      id: true,  
      image: true,
      username: true,
      tag: true,
      name: true,
    },
  })
  return res.send({
    senderId: db.id,
    image: db.image,
    username: db.username,
    tag: db.tag,
    name: db.name,
    id: user.id
  });
}
