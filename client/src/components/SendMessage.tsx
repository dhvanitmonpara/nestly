import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import useSocket from "../socket/useSocket";
import useUserStore from "../store/userStore";
import { useEffect, useRef, useState } from "react";
import type { IMessage } from "../types/IMessage";
import type { IChannel } from "../types/IChannel";
import type { IDirectMessage } from "../types/IDirectMessage";
import type { IConversation } from "../types/IConversation";

type SendMessageProps<T> = {
  setChannel: React.Dispatch<React.SetStateAction<T | null>>;
};

function SendMessage<T extends IChannel | IConversation>({
  setChannel,
}: SendMessageProps<T>) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const { channelId, serverId, conversationId } = useParams();
  const socket = useSocket();
  const user = useUserStore((s) => s.user);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!socket.socket) return;

    if (!channelId && !conversationId) {
      navigate("/");
      return;
    }

    if (!user) {
      navigate("/auth/signin");
      return;
    }

    if (!message) {
      toast.info("You can't send empty message");
      return;
    }

    let newMessage: IMessage | IDirectMessage | null = null;
    if (conversationId) {
      newMessage = {
        id: Date.now().toString(),
        content: message,
        conversation_id: conversationId,
        sender_id: user.id,
        createdAt: new Date().toISOString(),
      };
    } else if (channelId) {
      newMessage = {
        id: Date.now().toString(),
        content: message,
        channel_id: channelId,
        createdAt: new Date().toISOString(),
        user: {
          id: user.id,
          accent_color: user.accent_color,
          username: user.username,
          display_name: user.display_name,
        },
      };
    }

    setChannel((prev) => {
      return {
        ...prev,
        messages: prev?.messages
          ? [...prev.messages, newMessage]
          : [newMessage],
      } as T;
    });

    socket.socket.emit("message", {
      ...newMessage,
      serverId: serverId ?? conversationId,
    });
    setMessage("");
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!socket.socket || !user || !channelId) return;

    const s = socket.socket;

    if (!isTyping) {
      setIsTyping(true);
      s.emit("typing", { channelId, username: user.display_name, serverId });
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      s.emit("stop_typing", {
        channelId,
        username: user.display_name,
        serverId,
      });
    }, 2000); // 2 seconds after last keypress
  };

  useEffect(() => {
    if (!socket.socket) return;
    const s = socket.socket;

    const handleUserTyping = (username: string, channel_id: string) => {
      if (channel_id === channelId) {
        setTypingUsers((prev) =>
          prev.includes(username) ? prev : [...prev, username]
        );
      }
    };

    const handleUserStopTyping = (username: string, channel_id: string) => {
      if (channel_id === channelId) {
        setTypingUsers((prev) => prev.filter((id) => id !== username));
      }
    };

    s.on("user_typing", ({ username, channelId }) =>
      handleUserTyping(username, channelId)
    );

    s.on("user_stop_typing", ({ username, channelId }) =>
      handleUserStopTyping(username, channelId)
    );

    return () => {
      s.off("user_typing");
      s.off("user_stop_typing");
    };
  }, [channelId, socket.socket]);

  return (
    <div className="absolute bottom-0 left-4 w-[calc(100%-30px)] px-1 overflow-hidden">
      <div
        className={`text-xs text-zinc-900 bg-violet-500 rounded-t-sm mx-3 px-3 py-1 transition-all duration-100 ${
          typingUsers.length > 0 ? "translate-y-0" : "translate-y-20"
        }`}
      >
        {typingUsers.length > 0 &&
          `${
            typingUsers.length === 1
              ? typingUsers[0] + " is typing..."
              : typingUsers.join(", ") + " are typing..."
          }`}
      </div>
      <form onSubmit={handleSubmit} className="relative pb-4 bg-zinc-900">
        <input
          onChange={handleTyping}
          value={message}
          type="text"
          autoFocus
          placeholder="Type a message"
          className="w-full py-2 px-4 bg-zinc-800 rounded-md"
        />
        <button
          type="submit"
          className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold px-3 py-2 rounded-md absolute right-0 cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default SendMessage;
