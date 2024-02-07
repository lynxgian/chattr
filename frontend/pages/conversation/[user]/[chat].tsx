import { prisma } from '@/lib/service';
import { getCookie, setCookie } from 'cookies-next';
import { useState, useEffect, FormEvent, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from '@/components/ui/dropdown-menu';
import {
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  Dialog,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { AvatarImage, AvatarFallback, Avatar } from '@/components/ui/avatar';
import { getFormattedTimestamp } from '@/lib/formattedTimestamp';
import axios from 'axios';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import { CommandItem } from 'cmdk';
import { Label } from '@/components/ui/label';
import { Router, useRouter } from 'next/router';
import { headers } from 'next/headers';
let socket: Socket;

export const getServerSideProps = async ({ params }) => {
  const { user, chat } = params;

  const cookie = getCookie('accessCode', { path: '/' });

  const db = await prisma.user.findFirst({
    where: {
      id: user,
    },
    select: {
      username: true,
      image: true,
      id: true,
    },
  });
  const conversations = await prisma.conversations.findMany({
    where: {
      users: {
        some: {
          id: user,
        },
      },
    },
    select: {
      id: true,
      name: true,
      users: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  const chatData = await prisma.chats.findMany({
    select: {
      id: true,
      text: true,
      attachment: {
        select: {
          type: true,
          url: true,
          name: true,
          size: true,
        },
      },
      conversation: {
        select: {
          name: true,
          id: true,
        },
      },
      author: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
      timestamp: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  return {
    props: {
      username: db?.username,
      db: chatData,
      userId: user,
      avatar: db?.image,
      conversationId: chat,
      conversations,
    },
  };
};

export default function chat({
  avatar,
  db,
  username,
  userId,
  conversations,
  conversationId,
}) {
  const router = useRouter();
  const messagesContainerRef = useRef(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentURL, setAttachmentURL] = useState<string | ArrayBuffer>('');
  const [message, setMessage] = useState('');
  const [allMessages, setAllMessages] = useState(db);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    intilizeSocket();
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;

    return () => {
      socket.disconnect();
    };
  }, [allMessages, db]);

  const attachmentAdded = (e) => {
    const files = e.target.files;
    if (files) {
      const file = files[0];
      setAttachment(file);
      const render = new FileReader();
      render.onloadend = () => {
        setAttachmentURL(render.result);
      };
      render.readAsDataURL(file);
    }
  };

  const intilizeSocket = () => {
    socket = io('wss://ws.chattrbox.app', {
      transports: ['websocket'],
    });

    socket.on('chat-message', (data) => {
      setAllMessages((prevMessages) => [...prevMessages, data]);
      console.log(data);
    });

    socket.on('error', (data) => {
      console.log(data);
    });
  };
  const signout = () => {
    setCookie('accessCode', '')
    router.reload()
  }
  const timestamp = getFormattedTimestamp();
  const handleClick = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('attachment', attachment);
    formData.append('message', message);
    formData.append('conversationId', conversationId);
    formData.append('timestamp', timestamp);
    formData.append('avatar', avatar);
    formData.append('userId', userId);

    await axios.post('/api/conversations/createChat', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    socket.emit('chat-message', {
      text: message,
      attachment:
        attachment !== null
          ? {
            name: attachment.name,
            size: attachment.size,
            url: `https://images.chattrbox.app/${userId}/${attachment?.name}`,
            type: attachment.type,
          }
          : null,
      conversation: {
        id: conversationId,
      },
      author: {
        id: userId,
        username: username,
        image: avatar,
      },
      timestamp,
    });
    setMessage('');
    setAttachment(null);
    setAttachmentURL('');
  };
  return (
    <>
      <div key="1" className="flex flex-col h-screen bg-gray-900">
        <nav className="flex flex-row justify-between items-center bg-gray-800 border-b border-gray-700 " style={{ alignItems: 'center', justifyContent: 'space-evenly' }}>

          <Link href={'/'}>
            <h1 className="text-lg font-semibold text-gray-200 w-full md:w-auto">
              Chattr Box
            </h1>
          </Link>
          <h2 className="text-md font-semibold text-gray-200 mx-auto w-full md:w-auto mt-2 md:mt-0">
            {conversations
              .filter((x) => x.id === conversationId)
              .map((x) => x.name)}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full" size="icon" variant="outline">
                <GaugeIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Dialog open={open}>
                <DialogTrigger asChild>
                  <Button onClick={() => setOpen(true)}>
                    Conversation Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Conversation Settings</DialogTitle>
                  </DialogHeader>
                  <DialogContent>
                    <div>
                      <Label>Test</Label>
                      <Input placeholder="Test stay open porfavor" />
                    </div>
                  </DialogContent>
                  <DialogFooter>
                    <Button onClick={() => setOpen(false)}>Save</Button>
                    <>
                      <Button onClick={() => setOpen(false)} variant="outline">
                        Cancel
                      </Button>
                    </>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Profile</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                  </DialogHeader>
                  <DialogFooter>
                    <Button>Save</Button>
                    <>
                      <Button variant="outline">Cancel</Button>
                    </>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button onClick={signout}>Log Out</Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="flex flex-col md:flex-row flex-1">
         <aside className="w-full md:w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4 h-full">
              <h2 className="text-lg font-semibold text-gray-200">
                Conversations
              </h2>
              <div className="mt-4 space-y-2 relative">
                <Command>
                  <CommandInput placeholder="Search for conversations..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {conversations.map((x, key) => (
                        <CommandItem>
                          <Button
                            onClick={() =>
                              router.push(`/conversation/${userId}/${x.id}`)
                            }
                            className="flex items-center gap-2"
                          >
                            <span>{x.name}</span>
                          </Button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
              <div className="mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">New Conversation</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Conversation</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                      <Button>Create</Button>
                      <div>
                        <Button variant="outline">Cancel</Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </aside>
          <section className="flex-1 border-t border-gray-700 sm:border-t-0 sm:border-l">
          <div className="p-6 flex flex-col justify-between h-full overflow-y-auto">
            <div className="mt-6 space-y-6 flex-1 overflow-y-auto max-h-[calc(8*3.5rem)] bg-gray-800"
                style={{
                  scrollBehavior: 'smooth',
                  flexDirection: 'column',
                }}
                ref={messagesContainerRef}
              >

                {allMessages
                  .filter((x) => x.conversation?.id === conversationId)
                  .map((x, key) => (
                    <div key={key}>
                      <div
                        className={`${x.author.id === userId
                            ? 'flex items-end space-x-3 mt-6 justify-end'
                            : 'flex items-end space-x-3 mt-6'
                          }`}
                      >
                        <div
                          className={`${x.author.id === userId
                              ? 'order-2 pl-4'
                              : 'order-1 pr-4'
                            }`}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              alt={x.author.username}
                              src={x.author.image}
                            />
                            <AvatarFallback>
                              <UserIcon />
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div
                          className={`${x.author.id === userId
                              ? ' bg-blue-700 text-white rounded-lg px-4 py-2'
                              : 'bg-gray-700 text-white rounded-lg px-4 py-2'
                            } ${x.author.id === userId ? 'order-1' : 'order-2'}`}
                        >
                          <p className={`text-xs text-white text-left`}>
                            {x.author.username}
                          </p>
                          <p
                            className="text-sm"
                            style={{
                              maxWidth: '500px',
                              wordWrap: 'break-word',
                            }}
                          >
                            {x.text}
                            <Attachment
                              name={
                                x.attachment !== null
                                  ? x.attachment?.name
                                  : null
                              }
                              size={
                                x.attachment !== null
                                  ? x.attachment?.size
                                  : null
                              }
                              attachment={
                                x.attachment !== null ? x.attachment?.url : null
                              }
                              url={
                                x.attachment !== null ? x.attachment?.url : null
                              }
                              type={
                                x.attachment !== null
                                  ? x.attachment.type?.split('/')[0]
                                  : null
                              }
                            />
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {x.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-6 bg-gray-800 p-6">
              <form className="flex space-x-3">
                <div className="relative flex-grow">
                    {attachment ? (
                      <AttachmentData
                        name={attachment.name}
                        size={attachment.size}
                      />
                    ) : (
                      null
                    )}
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 rounded-lg text-white bg-gray-200 dark:bg-gray-800 border-none shadow-sm pr-10"
                      placeholder="Type a message..."
                    />
                    <Input
                      onChange={(e) => attachmentAdded(e)}
                      className="hidden"
                      name="file"
                      id="file-upload"
                      type="file"
                    />

                    <Label
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      htmlFor="file-upload"
                    >
                      <PaperclipIcon className="w-4 h-4" />
                    </Label>
                  </div>

                  <Button
                    onClick={(e) => handleClick(e)}
                    type="submit"
                    className="w-full md:w-20"
                  >
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function Attachment({ attachment, type, name, size, url }) {
  const formattedSize = fileSizeConverter(size);
  if (type === null) return null;
  switch (type) {
    case 'image':
      return <img src={attachment} />;
    case 'video':
      return <video src={attachment} />;
    default:
      return <OtherAttachments name={name} size={formattedSize} url={url} />;
  }
}

function OtherAttachments({ name, size, url }) {
  return (
    <>
      <a className='hover:underline' href={url}>
        <Label className=" flex space-x-3 justify-end bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center justify-between border border-gray-600 shadow-lg">
          <FileIcon className="h-4 w-4 mr-2" /> {name} ({size})
        </Label>
      </a>
    </>
  );
}

function AttachmentData({ name, size }) {
  const formattedSize = fileSizeConverter(size);

  return (
    <>
      <Label className="align-items-center align-self-center flex row space-x-10">
        <PaperclipIcon />
        {name} <p>{formattedSize}</p>
      </Label>
      <Button>Remove</Button>
    </>
  );
}

function fileSizeConverter(bytes) {
  if (bytes < 10000) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

function GaugeIcon(props) {
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
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

function SearchIcon(props) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function MessageCircleIcon(props) {
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
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  );
}

function FileIcon(props) {
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
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
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
  );
}
function PaperclipIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
