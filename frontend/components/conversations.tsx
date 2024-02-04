
import { Button } from "@/components/ui/button"
import { DialogTrigger, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogContent, Dialog, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardTitle, CardDescription } from "./ui/card"
import { useRouter } from "next/router"
import { Checkbox } from "@/components/ui/checkbox"

import { CommandInput, CommandEmpty, CommandItem, CommandGroup, CommandList, Command } from "@/components/ui/command"
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react"
import axios from "axios"
import { io } from "socket.io-client"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { DropdownMenuContent } from "./ui/dropdown-menu"
import toast from "react-hot-toast"

interface ConversationType {
  conversations: {
    name: string;
    id: string;
    users: [
      {
        username: string;
        id: string;
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
    avatar: string
  }
  currentUserFriendRequest:
  {
    id: string,
    user1id: string,
    user2id: string,
    status: string,
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
const socket = io('wss://ws.chattrbox.app', {
  transports: ["websocket"]
})
export default function Conversations({ conversations, users, currentUser, currentUserFriendRequest }: ConversationType) {
  const [selectedUsers, setSelectedUsers] = useState([`${currentUser.username}#${currentUser.tag}`])
  const [friendName, setFriendName] = useState('')
  const [friendRequests, setAllFriendRequests] = useState([currentUserFriendRequest])
  const [sent, isSent] = useState(false)

  const [message, setMessage] = useState('')
  const [isValid, setIsValid] = useState(false);
  const usernameTagRegex = /^[\w\d]+#\d{4}$/;
  const [username, setNewUsername] = useState(currentUser.username)
  const [conversationName, setConversationName] = useState('')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [newProfilePictureUrl, setNewProfilePictureUrl] = useState<string | ArrayBuffer>('')
  const [profilePictureUrl, setProfilePictureUrl] = useState(currentUser.avatar)
  const [success, setSuccess] = useState(false)


  useEffect(() => {
    intilizeSocket()
  }, [message, currentUser.id, currentUserFriendRequest, friendRequests, conversations, profilePicture, username, profilePictureUrl])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if(files) {
      const file = files[0]
      setProfilePicture(file)
      const render = new FileReader()
      render.onloadend = () => {
        setNewProfilePictureUrl(render.result)
      }
      render.readAsDataURL(file)
    } 
  }

  const handleSetImage = async (e) => {
      const formData = new FormData();
        formData.append('image', profilePicture);
        
    const res = await axios.post(`/api/user/setProfile`, formData, {
      headers: {
        'Content-Type': profilePicture.type
      },

    }) 
    setProfilePictureUrl(`https://images.chattrbox.app/${currentUser.id}/${profilePicture.name}`)
    setNewProfilePictureUrl('')
    setProfilePicture(null)
  }

  const intilizeSocket = () => {

    socket.on("friend-request", (data) => {
      setAllFriendRequests((prev) => [...prev, data])
    })

    socket.on("error", (data) => {
      console.log(data)
    })
  }
  const router = useRouter()
  const handleFriendRequestReject = async (id) => {
    const res = await axios.post('/api/user/rejectFriendRequest', {
      data: {
        id
      }
    })
    setAllFriendRequests([res.data])
    toast.success('Successfully Rejected The Friend Request!')
    
    
  }
  const handleFriendRequestAccept = async (id) => {
    const res = await axios.post('/api/user/acceptFriendRequest', {
      data: {
        id
      }
    })
    setAllFriendRequests([res.data])
    toast.success('Successfully Accepted The Friend Request!')
    
    
  }
  const handleInputChange = (e) => {
    const value:string = e.target.value
    const tag = value.indexOf('#')
    if(tag !== -1) {
      const digitsAfterKey = value.substring(tag + 1).replace(/\D/g, ''); 
      const truncatedDigits = digitsAfterKey.substring(0, 4); 

      setFriendName(value.substring(0, tag + 1) + truncatedDigits)

    } else {
      setFriendName(value)

    }

    setIsValid(usernameTagRegex.test(value))


  }
  const handleUsernameUpdate = (e) => {
      e.preventDefault()
      axios.post('/api/user/updateUsername', {
        data: {
          userId: currentUser.id,
          username: username
        }
      })
      setMessage('Successfully Updated Your Username to: ' + username)
      setSuccess(true)
      isSent(true)

  }
  const handleAddFriend = async (e) => {

    const userData = friendName.split('#')
    const res = await axios.post('/api/user/createFriendRequest', {
      data: {
        username: userData[0],
        tag: userData[1],
        currentUser: currentUser.id,

      }
    })

    if (res.status == 202) {
      isSent(true)
      return setMessage('Could not find that user!')

    }
    if (res.status === 203) {
      isSent(true)
      setMessage('You have already added this user!')
      return
    }

    isSent(true)
    setSuccess(true)
    setMessage('You have sucessfully added this user!')
    return socket.emit("friend-request", {
      user1id: res.data.senderId, user2id: res.data.id, status: "Pending", user1: {
        username: res.data.username, tag: res.data.tag, image: res.data.image, name: res.data.name
      }
    })


  }
  const handleUserSelection = (selectedUser) => {
    // Check if the user is already selected
    const isSelected = selectedUsers.includes(selectedUser.toString());

    // If selected, remove the user from the array; otherwise, add them
    setSelectedUsers((prevUsers) =>
      isSelected
        ? prevUsers.filter((user) => user !== selectedUser.toString())
        : [...prevUsers, selectedUser.toString()]
    );
  };
  const handleCreateConversation = async (e: FormEvent) => {
    const res = await axios.post('/api/conversations/createConversation', {
      data: {
        users: selectedUsers,
        name: conversationName
      }
    })
    router.push(`/conversation/${currentUser.id}/${res.data.conversation}`)
    setSelectedUsers([])

  }
  const handleClick = (id: any) => {
    router.push(`/conversation/${currentUser.id}/${id}/`)
  }

  return (
    <main key="1" className="flex flex-col h-screen bg-gray-900">
      <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="w-8 h-8 border">
                <AvatarImage alt={currentUser.username} src={profilePictureUrl} />
                <AvatarFallback><UserIcon /></AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="items-center" >
              {username + '#' + currentUser.tag}
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Profile</Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <h1 className="align-center">Edit Profile</h1>
                  </DialogHeader>
                  <Label htmlFor="profilePicture">Upload New Profile Picture </Label>
                  <img src={newProfilePictureUrl.toString()} />
                  <form>
                    <Input onChange={handleUpload} id="profilePicture" type="file" accept="image/*" />
                    <Button onClick={handleSetImage} type="button">Save</Button>
                  </form>
                  <form>
                    <Label htmlFor="username">Username</Label>
                    <p className={sent ? `${success ? `text-sm text-green-500` : `text-sm text-red-500`}` : "hidden"}>{message}</p>
                    <Input onChange={(e) => setNewUsername(e.target.value)} id="username" placeholder="Enter your username" />
                    <Button onClick={handleUsernameUpdate} type='button'>Save</Button>
                  </form>
                  <DialogFooter>
                    <DialogClose>Close</DialogClose>
                  </DialogFooter>
                </DialogContent>

              </Dialog>

            </DropdownMenuContent>
          </DropdownMenu>

          <h1 className="text-xl font-bold text-gray-100">Conversations</h1>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gray-700 text-gray-300">
                Add Friends
                <Badge className="ml-2" variant="secondary">
                  {friendRequests.find(x => x.id === "") || friendRequests.map(x => x.status !== "Pending") ? 0 : friendRequests.length}
                </Badge>
              </Button>

            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-800 space-y-4 p-8 border-4 border-gray-700">
              <Tabs className="w-full" defaultValue="requests">
                <TabsList className="flex gap-4">
                  <TabsTrigger value="requests">Friend Requests</TabsTrigger>
                  <TabsTrigger value="add">Add Friends</TabsTrigger>
                </TabsList>
                <TabsContent value="requests">
                  <DialogHeader>
                    <DialogTitle className="text-gray-100">Friend Requests</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Review your friend requests and decide whether to accept or decline.
                    </DialogDescription>
                  </DialogHeader>


                  {friendRequests.filter((x) => x.user1id !== currentUser.id && x.user2id === currentUser.id && x.status === "Pending").map((x, key) => (
                    <div className="grid ">
                      <div className="grid grid-cols-4 items-center">
                        <Avatar className="w-8 h-8 border">
                          <AvatarImage alt="@shadcn" src={x.user1.avatar} />
                          <AvatarFallback><UserIcon /></AvatarFallback>
                        </Avatar>
                        <div className="col-span-2">
                          <div className="col-span-2">
                            <div className="font-semibold text-lg">{x.user1.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">@{x.user1.username}#{x.user1.tag}</div>
                          </div>
                        </div>
                        <div className="flex justify-between space-x-2">
                          <Button onClick={() => handleFriendRequestAccept(x.id)} className="bg-gray-700 text-gray-300" type="submit">
                            <CheckIcon />
                          </Button>
                          <Button onClick={() => handleFriendRequestReject(x.id)}  className="bg-gray-700 text-gray-300" type="submit">
                            <XIcon />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                </TabsContent>
                <TabsContent value="add">
                  <DialogHeader>
                    <DialogTitle className="text-gray-100">Send Friend Requests</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      <p className={sent ? `${success ? `text-sm text-green-500` : `text-sm text-red-500`}` : "hidden"}>{message}</p>

                      Send a friend request by entering the user's name.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-gray-100" htmlFor="user-name">
                        User's Name
                      </Label>
                      <Input
                        className="col-span-3 bg-gray-700 text-gray-100"
                        placeholder="Enter friend's username and Tag! Ex: ChattrUser#0000"
                        value={friendName}
                        maxLength={friendName.indexOf('#') !== -1 ? friendName.indexOf('#') + 5 : undefined} // Set maxLength dynamically
                        onChange={(e) => handleInputChange(e)}
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button disabled={!isValid} onClick={(e) => handleAddFriend(e)} className="bg-gray-700 text-gray-300 align-center" type="submit">
                        Send Request
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="text-gray-500 border-gray-500" variant="outline">
                New Conversation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-100">New Conversation</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Start a new conversation by entering the recipient's name and your initial message.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>

            <DialogContent className="p-0">
              <Command>
                <CommandInput placeholder="Search for friends..." />
                <CommandList>
                  <CommandEmpty>No friends found.</CommandEmpty>
                  <CommandGroup heading="Users">
                    {(users.find(x => x.user1id === currentUser.id) ? users.filter(x => x.user2id !== currentUser.id) : users.filter(x => x.user1id !== currentUser.id)).map((x, key) => (
                      <CommandItem  onSelect={(e) => handleUserSelection(e)}>
                        <Checkbox onSelect={(e) => handleUserSelection(e)} id="user" />
                        <Label className="flex items-center gap-2" htmlFor="user3">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>{x.user1.username === currentUser.username ?  `${x.user2.username}#${x.user2.tag}` : `${x.user1.username}#${x.user1.tag}`}</span>
                        </Label>
                      </CommandItem>
                    ))}


                  </CommandGroup>
                </CommandList>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="conversation-name">Conversation Name</Label>
                    <Input value={conversationName} onChange={(e) => setConversationName(e.target.value)} type="conversation-name" id="conversation-name" placeholder="Enter conversation name" />
                  </div>
                  <Button disabled={!conversationName.trim() && selectedUsers.length == 0} onClick={(e) => handleCreateConversation(e)}>Create Conversation</Button>
                </div>
              </Command>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <div className="overflow-y-auto max-h-auto md:max-h-auto lg:max-h-auto">

        {conversations?.map((x, key) => (
          <div className="f overflow-y-auto p-4">
            <div className="space-y-4">
              <Card className="p-4 flex items-center justify-between bg-gray-800 text-gray-100">
                <div>
                  <CardTitle>{x.name}</CardTitle>
                  <CardDescription>Last message: {x.chats.map(x => x.author.username)}: {x.chats.map(x => x.text)} </CardDescription>
                  <CardDescription className="text-gray-400">
                    Users in conversation: {x.users.map(x => x.username).join(", ")}
                  </CardDescription>
                </div>
                <Button onClick={() => handleClick(x.id)} className="text-gray-500 border-gray-500 hover:text-white" variant="outline">
                  Open
                </Button>
              </Card>
            </div>
          </div>
        ))

        }

      </div>
    </main>
  )
}
function UserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}


function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
