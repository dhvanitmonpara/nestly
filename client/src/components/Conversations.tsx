import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import env from "../conf/env";
import { toast } from "sonner";
import useUserStore from "../store/userStore";
import { Separator } from "../components/ui/separator";
import useSocket from "../socket/useSocket";
import type { IConversation } from "../types/IConversation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { FiPlus } from "react-icons/fi";
import useHandleAuthError from "../hooks/useHandleAuthError";
import useDebounce from "../hooks/useDebounced";
import type { IUser } from "../types/IUser";
import Conversation from "./ConversationCard";
import { useNavigate } from "react-router-dom";
import ChannelSkeleton from "./ChannelSkeleton";

function Conversations() {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const socket = useSocket();
  const user = useUserStore((s) => s.user);

  const { handleAuthError } = useHandleAuthError();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        if (!user || !socket.socket) return;
        const res = await axios.get(
          `${env.SERVER_ENDPOINT}/dms/list/${user.id}`,
          { withCredentials: true }
        );

        if (res.status !== 200) {
          toast.error("Failed to fetch DMs");
          return;
        }

        setConversations(res.data.conversations);
      } catch (error) {
        handleAuthError(error as AxiosError);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket.socket, user]);

  if (loading) return <ChannelSkeleton />;

  return (
    <div className="space-y-1">
      <CreateConversationButton setConversations={setConversations} />
      <Separator className="bg-zinc-800" />
      {conversations.length > 0 &&
        conversations.map((c) => (
          <Conversation
            key={c.id}
            id={c.id}
            accentColor={
              c.userId1 === user?.id
                ? c.user2.accentColor
                : c.user1.accentColor
            }
            name={
              c.userId1 === user?.id
                ? c.user2.displayName
                : c.user1.displayName
            }
            setConversation={setConversations}
          />
        ))}
    </div>
  );
}

const CreateConversationButton = ({
  setConversations,
}: {
  setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
}) => {
  const [open, setOpen] = useState(false);
  const { handleAuthError } = useHandleAuthError();
  const user = useUserStore((s) => s.user);

  const navigate = useNavigate();

  const handleSubmit = async (u: IUser) => {
    const toastId = toast.loading(`Creating a new chat with ${u.displayName}`);
    try {
      const res = await axios.post(
        `${env.SERVER_ENDPOINT}/dms/create`,
        { userId1: u.id, userId2: user?.id },
        { withCredentials: true }
      );

      if (res.status !== 200 && res.status !== 201) {
        toast.error("Failed to create a conversation");
        return;
      }

      toast.success(
        `Successfully created a conversation with ${u.displayName}`
      );
      setConversations((prev) => [...prev, res.data.conversation]);
      navigate(`/dm/${res.data.conversation.id}`);
      setOpen(false);
    } catch (error) {
      handleAuthError(error as AxiosError);
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className=" flex justify-start items-center space-x-2 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 rounded-md px-3 py-2 w-full cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <FiPlus />
        <span className="font-semibold text-sm">Start a Conversation</span>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800 !max-w-96">
        <DialogHeader>
          <DialogTitle>Start a Conversation</DialogTitle>
          <DialogDescription>
            Start a new conversation by searching your friends.
          </DialogDescription>
        </DialogHeader>
        <SearchUserForm handleSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
};

const SearchUserForm = ({
  handleSubmit,
}: {
  handleSubmit: (user: IUser) => void;
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IUser[]>([]);

  const { handleAuthError } = useHandleAuthError();
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const handleSearch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${env.SERVER_ENDPOINT}/users/search/${debouncedQuery}`,
          { withCredentials: true }
        );

        if (res.status !== 200) {
          toast.error("Failed to get users");
          return;
        }

        setResults(res.data.results);
      } catch (error) {
        handleAuthError(error as AxiosError);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={query}
        className="bg-zinc-800 px-3 py-2 rounded-md w-full"
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
      />
      <div>
        {results.length > 0 ? (
          results.map((r) => (
            <button
              onClick={() => handleSubmit(r)}
              className="hover:bg-zinc-800/40 transition-colors px-2 py-1.5 rounded-md w-full text-left space-x-2 flex justify-start items-center text-zinc-300 hover:text-zinc-100"
            >
              <div
                className=" font-medium h-10 w-10 flex justify-center items-center rounded-full bg-zinc-800 border border-zinc-900"
                style={{ color: `#${r.accentColor}` }}
              >
                {r.username.slice(0, 2)}
              </div>
              <div>
                <p>{r.username}</p>
                <p className=" text-zinc-400">{r.email}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="h-28 flex items-center justify-center text-zinc-500">
            <p>
              {loading
                ? "Searching..."
                : query
                ? "No users found"
                : "Search for users..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;
