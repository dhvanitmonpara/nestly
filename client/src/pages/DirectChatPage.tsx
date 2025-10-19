import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import env from "../conf/env";
import useSocket from "../socket/useSocket";
import useUserStore from "../store/userStore";
import MessageCard from "../components/MessageCard";
import SendMessage from "../components/SendMessage";
import type { IConversation } from "../types/IConversation";
import type { IDirectMessage } from "../types/IDirectMessage";
import ChannelMessagesSkeleton from "../components/ChatSkeleton";
import { Skeleton } from "../components/ui/skeleton";

function DirectChatPage() {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<IConversation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const user = useUserStore((s) => s.user);
  const socket = useSocket();
  const navigate = useNavigate();

  const { conversationId } = useParams<{
    conversationId: string;
  }>();

  useEffect(() => {
    (async () => {
      setLoading(true);

      if (!conversationId || !user) {
        navigate("/");
        return;
      }

      try {
        const res = await axios.get(
          `${env.SERVER_ENDPOINT}/dms/messages/${conversationId}`,
          { withCredentials: true }
        );

        if (!res.data.data) {
          navigate("/");
          return;
        }

        setConversation(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [conversationId, navigate, user]);

  useEffect(() => {
    if (!socket.socket || !user?.id || !conversationId) return;

    const s = socket.socket;

    const handleMessage = (data: IDirectMessage) => {
      if (!conversationId) return;

      const newMessage: IDirectMessage = {
        id: Date.now().toString(),
        content: data.content,
        conversationId,
        senderId: data.senderId,
        createdAt: data.createdAt,
      };

      setConversation((prev) => {
        return {
          ...prev,
          messages: prev?.messages
            ? [...prev.messages, newMessage]
            : [newMessage],
        } as IConversation;
      });
    };

    const handleUpdateMessage = (data: {
      streamId: string;
      messageId: string;
      content: string;
    }) => {
      if (conversationId === data.streamId)
        setConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages
              ? prev.messages.map((m) =>
                m.id === data.messageId ? { ...m, content: data.content } : m
              )
              : [],
          } as IConversation;
        });
    };

    const handleDeleteMessage = (data: {
      streamId: string;
      messageId: string;
    }) => {
      if (conversationId === data.streamId)
        setConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages
              ? prev.messages.filter((m) => m.id !== data.messageId)
              : [],
          } as IConversation;
        });
    };

    s.emit("userOnlineDM", {
      userId: user.id,
      conversationId: conversationId.toString(),
    });

    s.on("message", handleMessage);
    s.on("updateMessage", handleUpdateMessage);
    s.on("deleteMessage", handleDeleteMessage);

    return () => {
      s.emit("userGotOfflineDM", {
        userId: user.id,
        conversationId: conversationId.toString(),
      });
      s.off("message", handleMessage);
      s.off("updateMessage", handleUpdateMessage);
      s.off("deleteMessage", handleDeleteMessage);
    };
  }, [conversationId, socket.socket, user?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="flex h-full max-h-screen">
      <div className="relative w-full">
        <div className="h-full overflow-y-auto w-full no-scrollbar">
          <div className="h-full">
            <div className="sticky top-0 bg-zinc-900 pl-[4.5rem] sm:pl-4 px-4 pt-4">
              <h1 className="w-full h-12 bg-zinc-800 px-4 rounded-md flex justify-start items-center">
                {conversation?.userId1 === user?.id
                  ? conversation?.user2?.displayName
                  : conversation?.user1?.displayName ?? <Skeleton className="w-16 h-5 rounded-md" />}
              </h1>
            </div>
            {loading ? (
              <ChannelMessagesSkeleton />
            ) : (
              <div className="px-4 pt-10 pb-60">
                <div className="sm:px-6 pb-4 text-lg font-semibold text-zinc-200">
                  <h3>
                    This is the beginning of an incredible conversation with{" "}
                    {conversation?.userId1 === user?.id
                      ? conversation?.user2?.displayName
                      : conversation?.user1?.displayName}
                  </h3>
                </div>
                {(conversation?.messages && conversation.messages.length > 0) ? (
                  conversation.messages.map((chat) => {
                    const messages = conversation?.messages || [];
                    const currentIndex = messages.findIndex(
                      (m) => m.id === chat.id
                    ); // find current message position

                    // Get the previous message in the array
                    const prevMessage =
                      currentIndex > 0 ? messages[currentIndex - 1] : null;

                    // Check if it's the first in the sequence
                    const isFirstFromUser =
                      prevMessage?.senderId !== chat.senderId;
                    return (
                      <MessageCard
                        key={chat.id}
                        setChannel={setConversation}
                        continuesMessage={!isFirstFromUser}
                        id={chat.id}
                        displayName={
                          chat.senderId === conversation.userId1
                            ? conversation.user1.displayName
                            : conversation.user2.displayName
                        }
                        accentColor={
                          chat.senderId === conversation.userId1
                            ? conversation.user1.accentColor
                            : conversation.user2.accentColor
                        }
                        content={chat.content}
                        createdAt={chat?.createdAt ?? null}
                        username={
                          chat.senderId === conversation.userId1
                            ? conversation.user1.username
                            : conversation.user2.username
                        }
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
          {conversation?.messages && (
            <SendMessage<IConversation>
              disabled={loading}
              lastMessage={
                conversation.messages[
                  conversation.messages.length - 1
                ]?.senderId.toString() !== user?.id.toString()
                  ? conversation?.messages[conversation.messages.length - 1]?.
                    content ?? null
                    : null
              }
              setChannel={setConversation}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default DirectChatPage;
