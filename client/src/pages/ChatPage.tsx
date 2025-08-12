import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import env from "../conf/env"
import useSocket from "../socket/useSocket"
import useUserStore from "../store/userStore"
import type { IMessage } from "../types/IMessage"
import type { IChannel } from "../types/IChannel"
import MessageCard from "../components/MessageCard"
import SendMessage from "../components/SendMessage"

type IncomingUserType = { userId: string, username: string, channelId: string, serverIds: string[] }

function ChatPage() {
  const [channel, setChannel] = useState<IChannel | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<IncomingUserType[]>([])
  const [loading, setLoading] = useState(false)

  const user = useUserStore(s => s.user)
  const socket = useSocket()
  const navigate = useNavigate()

  const { channelId, serverId } = useParams<{ channelId: string, serverId: string }>()

  useEffect(() => {
    (async () => {

      setLoading(true)

      if (!channelId || !user) {
        navigate("/")
        return
      }

      try {
        const res = await axios.get(`${env.SERVER_ENDPOINT}/messages/chat/${user.id}/${channelId}`, { withCredentials: true })

        if (!res.data) {
          navigate("/")
          return
        }

        setChannel(res.data.channel)

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    })()
  }, [channelId, navigate, user])

  useEffect(() => {
    setOnlineUsers([]);
    if (!socket.socket || !user?.id || !serverId || !channelId) return;

    const s = socket.socket;

    const handleMessage = (data: IMessage) => {
      if (!channelId) return;

      console.log('Received message:', data);
      const newMessage: IMessage = {
        id: Date.now().toString(),
        content: data.content,
        user: data.user,
        channel_id: channelId,
      };

      setChannel((prev) => {
        return {
          ...prev,
          messages: prev ? [
            ...prev.messages,
            newMessage
          ] : newMessage
        } as IChannel
      })
    };

    s.emit("userOnline", { channelId, serverId });

    s.on("userGotOnline", (data) => {
      console.log("User got online:", data);
      if (data.userId === user?.id) return; // Ignore own online status
      if (data.serverId === serverId && data.channelId === channelId) {
        setOnlineUsers((prev) => [...prev, { userId: data.userId, username: data.username, channelId, serverIds: [serverId] }]);
      }
    });

    s.on("previousOnlineUsers", (data) => {
      const users = data.filter((u: IncomingUserType) => u.serverIds.includes(serverId) && u.channelId === channelId);
      console.log("Previous online users:", data, users);
      setOnlineUsers(users);
    });

    s.on("userGotOffline", (data) => {
      console.log("User got offline:", data);
      setOnlineUsers((prev) => prev.filter((user) => user.userId !== data.userId));
    });

    s.on("message", handleMessage);

    return () => {
      s.emit("ChannelChanged", channelId);
      s.off("message", handleMessage);
      s.off("userGotOnline");
      s.off("userGotOffline");
    };
  }, [channelId, serverId, socket.socket, user?.id]);

  return (
    <div className="flex h-full max-h-screen">
      <div className="relative w-full">
        <div className="h-full overflow-y-auto w-full no-scrollbar">
          <div className="h-full">
            <div className="sticky top-0 bg-zinc-900 px-4 pt-4">
              <h1 className="w-full h-12 bg-zinc-800 px-4 rounded-md flex justify-start items-center">
                {channel?.name ?? "Loading..."}
              </h1>
            </div>
            <div className="px-4 pt-10 pb-60 divide-y divide-zinc-800/50">
              {loading ? (
                <h2>Loading...</h2>
              ) : (
                channel?.messages.map((chat) => (
                  <MessageCard key={chat.id} chat={chat} />
                ))
              )}
            </div>
          </div>
          <SendMessage setChannel={setChannel} />
        </div>
      </div>
      <div className="h-full overflow-y-auto w-96 bg-zinc-800">
        <div className="p-4 font-semibold text-lg flex">
          <span>
            Online Users
          </span>
          <span className="bg-zinc-900 rounded-xl w-10 ml-2 text-xs flex justify-center items-center">{onlineUsers.length}</span>
        </div>
        {onlineUsers.length > 0 ? onlineUsers.map((user) => (
          <div key={user.userId} className="px-4 py-2 border-b flex justify-start space-x-2 border-zinc-700">
            <div className="font-semibold bg-zinc-900 rounded-full w-8 h-8 flex items-center justify-center">
              {user.username.slice(0, 2)}
            </div>
            <div>
              {user.username}
            </div>
          </div>
        )) : <div className="h-40 flex justify-center items-center text-zinc-400 text-sm">No users online</div>}
      </div>
    </div>
  )
}

export default ChatPage