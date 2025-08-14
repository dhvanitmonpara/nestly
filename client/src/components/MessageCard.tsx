import { MdDelete, MdEdit } from "react-icons/md";
import formatTimestamp from "../utils/formatTimeStampt";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import useHandleAuthError from "../hooks/useHandleAuthError";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import env from "../conf/env";
import type { IChannel } from "../types/IChannel";
import type { IConversation } from "../types/IConversation";
import { useState } from "react";

type MessageCardProps<T> = {
  setChannel: React.Dispatch<React.SetStateAction<T | null>>;
  id: string;
  username: string;
  accent_color: string;
  content: string;
  createdAt: string | null;
  continuesMessage?: boolean;
};

function MessageCard<T extends IChannel | IConversation>({
  id,
  username,
  accent_color,
  content,
  createdAt,
  continuesMessage = false,
  setChannel,
}: MessageCardProps<T>) {
  const color = `#${accent_color}`;
  return (
    <div
      className={`flex space-x-2 ${
        continuesMessage ? "py-0.5" : "pt-2 mt-2 border-t border-zinc-800"
      } mx-6 group`}
      key={id}
    >
      {continuesMessage ? (
        <div className="w-8 text-[0.60rem] opacity-0 group-hover:opacity-100 text-gray-400 line-clamp-1">
          {createdAt ? formatTimestamp(createdAt) : ""}
        </div>
      ) : (
        <div
          className="flex justify-center items-center bg-zinc-800 h-8 w-8 rounded-full font-semibold text-sm"
          style={{ color }}
        >
          {username.slice(0, 2)}
        </div>
      )}
      <div className="w-full">
        {!continuesMessage && (
          <div className={`text-sm flex justify-start items-center space-x-2`}>
            <span
              className="text-xs"
              style={{
                color: color,
              }}
            >
              {username || "Unknown"}
            </span>
            <div className="space-x-3 flex items-center justify-between w-full">
              <span className="text-[0.70rem] text-zinc-500">
                {createdAt ? formatTimestamp(createdAt) : ""}
              </span>
              <MessageForm id={id} setChannel={setChannel} content={content} />
            </div>
          </div>
        )}
        <div className="text-zinc-200 text-sm flex justify-between">
          <span>{content}</span>
          {continuesMessage && (
            <MessageForm id={id} setChannel={setChannel} content={content} />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageForm<T extends IChannel | IConversation>({
  id,
  setChannel,
  content,
}: {
  id: string;
  setChannel: React.Dispatch<React.SetStateAction<T | null>>;
  content: string;
}) {
  const [value, setValue] = useState(content);

  const { handleAuthError } = useHandleAuthError();

  const handleDeleteMessage = async () => {
    const toastId = toast.loading("Deleting message...");
    try {
      const res = await axios.delete(
        `${env.SERVER_ENDPOINT}/messages/delete/${id}`,
        { withCredentials: true }
      );

      if (res.status !== 200) {
        toast.error("Failed to delete message");
        return;
      }

      toast.success("Message deleted successfully");
      setChannel((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: prev.messages
            ? prev.messages.filter((m) => m.id !== id)
            : [],
        } as T;
      });
    } catch (error) {
      handleAuthError(error as AxiosError);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleUpdateMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const toastId = toast.loading("Updating message...");
    try {
      const res = await axios.put(
        `${env.SERVER_ENDPOINT}/messages/update/${id}`,
        { content: value },
        { withCredentials: true }
      );

      if (res.status !== 200) {
        toast.error("Failed to update message");
        return;
      }

      toast.success("Message updated successfully");
      setChannel((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: prev.messages
            ? prev.messages.map((m) =>
                m.id === id ? { ...m, content: value } : m
              )
            : [],
        } as T;
      });
    } catch (error) {
      handleAuthError(error as AxiosError);
    } finally {
      toast.dismiss(toastId);
      setValue("");
    }
  };

  return (
    <div className="space-x-3 flex items-center">
      <div className="divide-x divide-zinc-700">
        <Dialog>
          <DialogTrigger className="text-zinc-500 text-xs hover:text-zinc-300 p-1 rounded-l-md opacity-0 group-hover:opacity-100 transition-all bg-zinc-800 hover:bg-zinc-700 cursor-pointer">
            <MdEdit />
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800 !max-w-96">
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
              <DialogDescription>
                Make changes to your message below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateMessage} className="space-y-4">
              <input
                type="text"
                placeholder="Type your message here..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-zinc-800 px-3 py-2 rounded-md w-full"
              />
              <DialogClose
                type="submit"
                className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60"
              >
                Update Message
              </DialogClose>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger className="text-zinc-500 text-xs hover:text-zinc-300 p-1 rounded-r-md opacity-0 group-hover:opacity-100 transition-all bg-zinc-800 hover:bg-red-500 cursor-pointer">
            <MdDelete />
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800 !max-w-96">
            <DialogHeader>
              <DialogTitle>Delete Message</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this message?
              </DialogDescription>
              <div className="flex space-x-2 mt-2">
                <DialogClose
                  type="submit"
                  className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </DialogClose>
                <DialogClose
                  type="submit"
                  onClick={handleDeleteMessage}
                  className="px-4 py-2 bg-red-500 text-zinc-100 font-semibold w-full rounded-md hover:bg-red-600 cursor-pointer disabled:opacity-60"
                >
                  Delete
                </DialogClose>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default MessageCard;
