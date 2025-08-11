import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import env from "../conf/env"
import { toast } from "sonner"
import useSocket from "../socket/useSocket"
import useUserStore from "../store/userStore"
import type { IMessage } from "../types/IMessage"
import type { IServer } from "../types/IServer"

function ChatPage() {

  const [server, setServer] = useState<IServer | null>(null)
  const [loading, setLoading] = useState(false)

  const serverId = useParams().serverId
  const user = useUserStore(s => s.user)
  const socket = useSocket()
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {

      setLoading(true)

      if (!serverId || !user) {
        navigate("/")
        return
      }

      try {
        const res = await axios.get(`${env.SERVER_ENDPOINT}/messages/chat/${user.id}/${serverId}`, { withCredentials: true })

        if (!res.data) {
          navigate("/")
          return
        }

        setServer(res.data.server)

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    })()
  }, [serverId, navigate, user])

  useEffect(() => {
    if (!socket.socket) return;

    const s = socket.socket;

    const handleMessage = (data: IMessage) => {
      console.log('Received message:', data);
      const newMessage = {
        id: Date.now().toString(),
        content: data.content,
        user: data.user,
      };

      setServer((prev) => {
        return {
          ...prev,
          channels: prev ? [
            ...prev.channels,
            newMessage
          ] : newMessage
        } as IServer
      })
    };

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("message", handleMessage);

    return () => {
      s.off("message", handleMessage);
    };
  }, [socket]);

  return (
    <div className="h-full max-h-screen overflow-y-auto">
      <div className="h-full">
        <div className="sticky top-0 bg-zinc-900 px-4 pt-4">
          <h1 className="w-full h-12 bg-zinc-800 px-4 rounded-md flex justify-start items-center">
            {server?.name ?? "Loading..."}
          </h1>
        </div>
        <div className="px-4 pt-10 pb-60">
          {loading ? (
            <h2>Loading...</h2>
          ) : (
            server?.channels.map((chat) => {
              const color = `#${chat.user.accent_color}`
              return <div className="my-2 mx-6" key={chat.id}>
                <p
                  style={{
                    color: color
                  }}
                  className={`text-sm ${color}`}
                >{chat.user?.username || "Unknown"}</p>
                <p className="text-zinc-200">{chat.content}</p>
              </div>
            })
          )}
        </div>
      </div>
      <SendMessage setServer={setServer} />
    </div>
  )
}


const SendMessage = ({ setChannel }: { setChannel: React.Dispatch<React.SetStateAction<IChannelWithMessage | null>> }) => {
  const [message, setMessage] = useState("")

  const navigate = useNavigate()
  const channelId = useParams().channelId
  const socket = useSocket()
  const user = useUserStore(s => s.user)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!socket.socket) return

    if (!channelId) {
      navigate("/")
      return
    }

    if (!user) {
      navigate("/auth/signin")
      return
    }

    if (!message) {
      toast.info("You can't send empty message")
      return
    }

    const newMessage: IMessageWithUser = {
      id: Date.now().toString(),
      content: message,
      channel_id: channelId,
      user: {
        id: user.id,
        accent_color: user.accent_color,
        username: user.username,
        display_name: user.display_name
      },
    }

    setChannel((prev) => {
      return {
        ...prev,
        messages: prev ? [
          ...prev.messages,
          newMessage
        ] : newMessage
      } as IChannelWithMessage
    })

    socket.socket.emit("message", newMessage)
    setMessage("")
  }

  return (
    <div className="fixed bottom-0 right-4 w-[calc(100vw-250px)]">
      <form onSubmit={handleSubmit} className="relative pb-4 bg-zinc-900">
        <input onChange={(e) => setMessage(e.target.value)} value={message} type="text" placeholder="Type a message" className="w-full py-2 px-4 bg-zinc-800 rounded-md" />
        <button type="submit" className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold px-3 py-2 rounded-md absolute right-0 cursor-pointer">
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatPage