import { MdDelete, MdDone, MdEdit } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { IoMdClose } from "react-icons/io";
import { HiDotsHorizontal } from "react-icons/hi";
import useHandleAuthError from "../hooks/useHandleAuthError";
import type { AxiosError } from "axios";
import axios from "axios";
import env from "../conf/env";
import { toast } from "sonner";
import { useState } from "react";
import { FaVoicemail } from "react-icons/fa";
import type { IChannel } from "../types/IChannel";
import { IoChatbubbleSharp } from "react-icons/io5";
import clsx from "clsx";
import useFeatureStore from "../store/featureStore";

function ChannelCard({
  id,
  name,
  setChannel,
  type,
  roomParticipantsCount,
  isOwner = false,
}: {
  id: number;
  name: string;
  setChannel: React.Dispatch<React.SetStateAction<IChannel[]>>;
  type: "text" | "voice";
  roomParticipantsCount?: number;
  isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editInput, setEditInput] = useState("");
  const setSidebarOpen = useFeatureStore((s) => s.setSidebarOpen);

  const { handleAuthError } = useHandleAuthError();
  const navigate = useNavigate();

  const { serverId, channelId } = useParams();

  const handleDeleteChannel = async () => {
    const toastId = toast.loading(`Deleting the channel ${name}`);
    try {
      const res = await axios.delete(
        `${env.SERVER_ENDPOINT}/channels/id/${id.toString()}`,
        { withCredentials: true }
      );

      if (res.status !== 200) {
        toast.error("Failed to delete the channel");
        return;
      }

      setChannel((prev) => prev.filter((c) => c.id !== id));
      navigate(`/s/${serverId}`);
    } catch (error) {
      handleAuthError(error as AxiosError);
      console.log("failed");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleEditChannel = async () => {
    const toastId = toast.loading("Updating channel name");
    try {
      const res = await axios.patch(
        `${env.SERVER_ENDPOINT}/channels/update/${id}`,
        { name: editInput },
        { withCredentials: true }
      );

      if (res.status !== 200) {
        toast.error("Failed to update the channel");
        return;
      }

      setChannel((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: editInput } : c))
      );
      setEditMode(false);
      setEditInput("");
    } catch (error) {
      handleAuthError(error as AxiosError);
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <Link
      to={`/s/${serverId}/c/${id}${type === "voice" ? "/rooms" : ""}`}
      key={id}
      onClick={() => setSidebarOpen(false)}
      className={clsx(
        "flex items-center justify-between group/card cursor-pointer rounded-md",
        editMode ? "transition-colors" : "px-3 hover:bg-zinc-700/50",
        !isOwner && "py-2",
        id.toString() === channelId && "bg-zinc-700/50"
      )}
    >
      {editMode ? (
        <div className="bg-zinc-700/70 rounded-md relative w-full">
          <input
            type="text"
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            autoFocus
            className="px-3 py-2 w-44 rounded-md"
          />
          <div
            onClick={handleEditChannel}
            className="flex flex-col justify-center items-center ml-1 absolute -right-6 top-0"
          >
            <button
              className={`p-0.5 bg-green-500 hover:bg-green-600 cursor-pointer rounded-full transition-all ${
                editInput ? "scale-100" : "scale-0"
              }`}
            >
              <MdDone />
            </button>
            <button
              onClick={() => {
                setEditInput("");
                setEditMode(false);
              }}
              className="p-0.5 bg-red-500 hover:bg-red-600 cursor-pointer rounded-full"
            >
              <IoMdClose />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center text-zinc-300 font-semibold space-x-2">
          {type === "text" ? <IoChatbubbleSharp /> : <FaVoicemail />}
          <span>{name}</span>
        </div>
      )}
      {!editMode && isOwner && (
        <div className="space-x-1 flex justify-center items-center">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="hover:bg-zinc-300 hover:text-zinc-900 md:opacity-0 md:group-hover/card:opacity-100 transition-colors px-2 py-1 my-1 rounded-full cursor-pointer"
            >
              <HiDotsHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-800 text-zinc-300 border-zinc-800">
              <DropdownMenuItem
                onClick={() => {
                  setEditMode(true);
                  setEditInput(name);
                }}
                className="text-zinc-100 flex justify-start items-center space-x-1"
              >
                <MdEdit className="text-zinc-300" />
                <span className=" font-semibold text-zinc-300">
                  Edit
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteChannel}
                variant="destructive"
                className="text-zinc-300 flex justify-start items-center space-x-1"
              >
                <MdDelete />
                <span className=" font-semibold">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {Boolean(roomParticipantsCount) && (
            <span className="px-3  inline-block rounded-xl bg-zinc-700">
              {roomParticipantsCount}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export default ChannelCard;
