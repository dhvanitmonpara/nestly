import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import env from "../conf/env"
import { toast } from "sonner"
import useSocket from "../socket/useSocket"
import useUserStore from "../store/userStore"
import type { IMessage } from "../types/IMessage"
import type { IChannel } from "../types/IChannel"
import formatTimestamp from "../utils/formatTimeStampt"

function ChatPage() {
  const [channel, setChannel] = useState<IChannel | null>(null)
  const [loading, setLoading] = useState(false)

  const user = useUserStore(s => s.user)
  const socket = useSocket()
  const navigate = useNavigate()

  const { channelId } = useParams<{ channelId: string }>()

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
    if (!socket.socket) return;

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

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("message", handleMessage);

    return () => {
      s.off("message", handleMessage);
      s.off("disconnect");
    };
  }, [channelId, socket]);

  return (
    <div className="h-full max-h-screen overflow-y-auto">
      <div className="h-full">
        <div className="sticky top-0 bg-zinc-900 px-4 pt-4">
          <h1 className="w-full h-12 bg-zinc-800 px-4 rounded-md flex justify-start items-center">
            {channel?.name ?? "Loading..."}
          </h1>
        </div>
        <div className="px-4 pt-10 pb-60">
          {loading ? (
            <h2>Loading...</h2>
          ) : (
            channel?.messages.map((chat) => {
              const color = `#${chat.user?.accent_color}`
              return <div className="my-2 mx-6" key={chat.id}>
                <p
                  className={`text-sm flex justify-between items-center`}
                >
                  <span style={{
                    color: color
                  }}>{chat.user?.username || "Unknown"}</span>
                  <span className="text-[0.70rem] text-zinc-500">{chat.createdAt ? formatTimestamp(chat.createdAt) : ""}</span>
                </p>
                <p className="text-zinc-200">{chat.content}</p>
              </div>
            })
          )}
        </div>
      </div>
      <SendMessage setChannel={setChannel} />
    </div>
  )
}


const SendMessage = ({ setChannel }: { setChannel: React.Dispatch<React.SetStateAction<IChannel | null>> }) => {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  let typingTimeout: NodeJS.Timeout

  const navigate = useNavigate()
  const channelId = useParams().channelId
  const socket = useSocket()
  const user = useUserStore(s => s.user)
  const { serverId } = useParams()

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

    const newMessage: IMessage = {
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
      } as IChannel
    })

    socket.socket.emit("message", { ...newMessage, serverId })
    setMessage("")
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    if (!socket.socket || !user || !channelId) return

    const s = socket.socket

    if (!isTyping) {
      setIsTyping(true)
      s.emit("typing", { channelId, username: user.display_name, serverId })
    }

    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      setIsTyping(false)
      s.emit("stop_typing", { channelId, username: user.display_name, serverId })
    }, 2000) // 2 seconds after last keypress
  }

  useEffect(() => {
    if (!socket.socket) return
    const s = socket.socket

    const handleUserTyping = (username: string, channel_id: string) => {
      if (channel_id === channelId) {
        setTypingUsers((prev) =>
          prev.includes(username) ? prev : [...prev, username]
        )
      }
    }

    const handleUserStopTyping = (username: string, channel_id: string) => {
      if (channel_id === channelId) {
        setTypingUsers((prev) => prev.filter((id) => id !== username))
      }
    }

    s.on("user_typing", ({ username, channelId }) => handleUserTyping(username, channelId))

    s.on("user_stop_typing", ({ username, channelId }) => handleUserStopTyping(username, channelId))

    return () => {
      s.off("user_typing")
      s.off("user_stop_typing")
    }
  }, [channelId, socket.socket])

  return (
    <div className="fixed bottom-0 right-4 w-[calc(100vw-290px)]">
      <div className={`text-xs text-zinc-900 bg-violet-500 rounded-t-sm mx-3 px-3 py-1 transition-all duration-100 ${typingUsers.length > 0 ? "translate-y-0" : "translate-y-20"}`}>
        {typingUsers.length > 0 &&
          `${typingUsers.length === 1
            ? typingUsers[0] + " is typing..."
            : typingUsers.join(", ") + " are typing..."}`
        }
      </div>
      <form onSubmit={handleSubmit} className="relative pb-4 bg-zinc-900">
        <input onChange={handleTyping} value={message} type="text" placeholder="Type a message" className="w-full py-2 px-4 bg-zinc-800 rounded-md" />
        <button type="submit" className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold px-3 py-2 rounded-md absolute right-0 cursor-pointer">
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatPage