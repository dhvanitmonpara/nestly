import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import env from "../conf/env";
import useSocket from "../socket/useSocket";
import useUserStore from "../store/userStore";
import type { IMessage } from "../types/IMessage";
import type { IChannel } from "../types/IChannel";
import MessageCard from "../components/MessageCard";
import SendMessage from "../components/SendMessage";

function ChatPage() {
  const [channel, setChannel] = useState<IChannel | null>(null);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const user = useUserStore((s) => s.user);
  const socket = useSocket();
  const navigate = useNavigate();

  const { channelId, serverId } = useParams<{
    channelId: string;
    serverId: string;
  }>();

  useEffect(() => {
    (async () => {
      setLoading(true);

      if (!channelId || !user) {
        navigate("/");
        return;
      }

      try {
        const res = await axios.get(
          `${env.SERVER_ENDPOINT}/messages/chat/${user.id}/${channelId}`,
          { withCredentials: true }
        );

        if (!res.data) {
          navigate("/");
          return;
        }

        setChannel(res.data.channel);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [channelId, navigate, user]);

  useEffect(() => {
    if (!socket.socket || !user?.id || !serverId || !channelId) return;

    const s = socket.socket;

    const handleMessage = (data: IMessage) => {
      if (!channelId) return;

      const newMessage: IMessage = {
        id: Date.now().toString(),
        content: data.content,
        user: data.user,
        createdAt: data.createdAt,
        channel_id: channelId,
      };

      setChannel((prev) => {
        return {
          ...prev,
          messages: prev ? [...prev.messages, newMessage] : newMessage,
        } as IChannel;
      });
    };

    const handleDeleteMessage = (data: {
      streamId: string;
      messageId: string;
    }) => {
      if (channelId === data.streamId)
        setChannel((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages
              ? prev.messages.filter((m) => m.id !== data.messageId)
              : [],
          } as IChannel;
        });
    };

    const handleUpdateMessage = (data: {
      streamId: string;
      messageId: string;
      content: string;
    }) => {
      if (channelId === data.streamId)
        setChannel((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages
              ? prev.messages.map((m) =>
                  m.id === data.messageId ? { ...m, content: data.content } : m
                )
              : [],
          } as IChannel;
        });
    };

    s.on("message", handleMessage);
    s.on("updateMessage", handleUpdateMessage);
    s.on("deleteMessage", handleDeleteMessage);

    return () => {
      s.off("updateMessage", handleUpdateMessage);
      s.off("deleteMessage", handleDeleteMessage);
      s.off("message", handleMessage);
    };
  }, [channelId, serverId, socket.socket, user?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [channel?.messages]);

  return (
    <div className="flex h-full max-h-screen">
      <div className="relative w-full">
        <div className="h-full overflow-y-auto w-full no-scrollbar">
          <div className="h-full">
            <div className="sticky flex justify-center items-center pl-[4.5rem] sm:pl-4 top-0 bg-zinc-900 px-4 pt-4">
              <h1 className="w-full h-12 bg-zinc-800 px-4 rounded-md flex justify-start items-center">
                {channel?.name ?? "Loading..."}
              </h1>
            </div>
            {loading ? (
              <h2>Loading...</h2>
            ) : (
              <div className="px-4 pt-10 pb-60">
                <div className="sm:px-6 pb-4 text-lg font-semibold text-zinc-200">
                  <h3>Welcome to {channel?.name}</h3>
                </div>
                {channel?.messages && channel.messages.length > 0 ? (
                  channel.messages.map((chat) => {
                    const messages = channel?.messages || [];
                    const currentIndex = messages.findIndex(
                      (m) => m.id === chat.id
                    ); // find current message position

                    // Get the previous message in the array
                    const prevMessage =
                      currentIndex > 0 ? messages[currentIndex - 1] : null;

                    // Check if it's the first in the sequence
                    const isFirstFromUser =
                      prevMessage?.user?.id !== chat.user?.id;
                    return (
                      <MessageCard
                        key={chat.id}
                        continuesMessage={!isFirstFromUser}
                        id={chat.id}
                        accentColor={chat.user?.accentColor}
                        content={chat.content}
                        createdAt={chat?.createdAt ?? null}
                        username={chat.user?.username}
                        setChannel={setChannel}
                        displayName={chat?.user.displayName}
                      />
                    );
                  })
                ) : (
                  <div className="text-zinc-400  px-6 pt-3 border-t border-zinc-800 h-40">
                    <h4>No messages yet</h4>
                  </div>
                )}
              </div>
            )}
          </div>
          <SendMessage<IChannel>
            setChannel={setChannel}
            lastMessage={
              channel?.messages[channel.messages.length - 1]?.user.username !==
              user?.username
                ? channel?.messages[channel.messages.length - 1]?.content ?? null
                : null
            }
          />
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
