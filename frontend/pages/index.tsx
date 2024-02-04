import Conversations from '@/components/conversations'
import { prisma } from '@/lib/service'
import { Friends } from '@prisma/client/edge';
import { getCookie } from 'cookies-next'
interface ConversationType {
  database: {
    conversations: {
      name: string;
      id: string;
      users: [
        {
          username: string,
          id: string
        }

      ]
      chats: [
        {
          text: string,
          author: {
            username: string
          }
        }
      ]


    }[];

  };
  users: {
    id: string,
    status: 'Friends',
    user1id: string,
    user2id: string,
    user1: { image: string, username: string, tag: string, name: string },
    user2: {
      username: string,
      tag: string,
      avatar: string,
      name: string,
    }
  }[]
  currentUser: {
    id: string,
    username: string,
    tag: string,
    avatar: string,
    
  }
  currentUserFriendRequest: 
      {
      id: string,
      user1id: string,
      status: string
      user2id: string,
      user1: {
        username: string,
        tag: string,
        avatar: string, 
        name: string,
      },
      user2: {
        username: string,
        tag: string,
        avatar: string,
        name: string,
      }
    } 
   
  
}

export const getServerSideProps = async ({ req, res }) => {
  const cookie = getCookie('accessCode', { path: '/', req, res })
  const users = await prisma.friends.findMany({
    where: {
      OR: [
        { user1Id: cookie.toString() },
        { user2Id: cookie.toString()}
      ],
      status: "Friends"
    },
    select: {
      user1: true,
      user2: true
    }
    
    
  })
  const friendRequests = await prisma.friends.findMany({
    where: {
      OR: [
        {user2Id: cookie?.toString()},
        {user1Id: cookie?.toString()}
      ]
      
    },
    select: {
      id: true,
      user1Id: true,
      user2Id: true,
      status: true,
      user1: {
        select: {
          image: true,
          username: true,
          tag: true,
          name: true
        }
      },
      user2: {
        select: {
          image: true,
          username: true,
          tag: true,
          name: true
        }
      }
    }
  })
  const user = await prisma.user.findUnique({
    where: {
      id: cookie?.toString(),
    },
    include: {

      conversations: {
        select: {
          id: true,
          name: true,
          users: {
            select: {
              username: true,
              id: true,
              tag: true,
              image: true
            },
          },
          chats: {
            select: {
              text: true,
              author: {
                select: {
                  username: true,
                },
              },
            },
            orderBy: {
              id: 'desc',
            },
            take: 1,
          },
        },
      },
    },
  });


  return {
    props: {
      database: user,
      cookie: cookie?.toString(),
      users: users,
      currentUser: {
        id: user.id,
        username: user.username,
        tag: user.tag,
        avatar: user.image
      },
      currentUserFriendRequest: {
        id: friendRequests.map(x => x.id).toString(),
        status: friendRequests.map(x => x.status).toString(),
        user1id: friendRequests.map(x => x.user1Id).toString(),
        user2id: friendRequests.map(x => x.user2Id).toString(),
        user1: {
          image: friendRequests.map(x => x.user1.image).toString(),
          username: friendRequests.map(x => x.user1.username).toString(),
          tag: friendRequests.map(x => x.user1.tag).toString(),
          name: friendRequests.map(x => x.user1.name).toString()
        },
        user2: {
          image: friendRequests.map(x => x.user1.image).toString(),
          username: friendRequests.map(x => x.user1.username).toString(),
          tag: friendRequests.map(x => x.user1.tag).toString(),
          name: friendRequests.map(x => x.user1.name).toString()
        }  
      } 
    }
  }

}


export default function Home({ database,  users, currentUser, currentUserFriendRequest}: ConversationType) {

  return (
    <>
      <Conversations  currentUserFriendRequest={currentUserFriendRequest} conversations={database?.conversations} users={users} currentUser={currentUser} />
    </>
  )
}
