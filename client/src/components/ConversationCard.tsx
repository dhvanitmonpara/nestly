import { MdDelete } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { HiDotsHorizontal } from "react-icons/hi";
import useHandleAuthError from "../hooks/useHandleAuthError";
import type { AxiosError } from "axios";
import axios from "axios";
import env from "../conf/env";
import { toast } from "sonner";
import { useState } from "react";
import type { IConversation } from "../types/IConversation";
import useFeatureStore from "../store/featureStore";

function DirectConversationCard({
  id,
  name,
  accent_color,
  setConversation,
}: {
  id: number;
  name: string;
  accent_color: string;
  setConversation: React.Dispatch<React.SetStateAction<IConversation[]>>;
}) {
  const [open, setOpen] = useState(false);

  const { handleAuthError } = useHandleAuthError();
  const navigate = useNavigate();

  const setSidebarOpen = useFeatureStore((s) => s.setSidebarOpen);
  const { conversationId } = useParams();

  const handleDeleteServer = async () => {
    const toastId = toast.loading(`Deleting the server ${name}`);
    try {
      const res = await axios.delete(
        `${env.SERVER_ENDPOINT}/dms/delete/${id.toString()}`,
        { withCredentials: true }
      );

      if (res.status !== 200) {
        toast.error("Failed to delete the server");
        return;
      }

      setConversation((prev) => prev.filter((c) => c.id !== id));
      navigate("/dm");
    } catch (error) {
      handleAuthError(error as AxiosError);
      console.log("failed");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <Link
      to={`/dm/${id}`}
      key={id}
      onClick={(e) => {
        e.stopPropagation();
        setSidebarOpen(false);
      }}
      className={`flex items-center justify-between group px-3 hover:bg-zinc-700/50 ${
        id.toString() === conversationId && "bg-zinc-700/50"
      } cursor-pointer rounded-md`}
    >
      <div
        key={id}
        className="py-2 flex justify-start space-x-2 w-full items-center text-zinc-300"
      >
        <div
          style={{ color: `#${accent_color}` }}
          className="font-semibold bg-zinc-900 rounded-full w-7 h-7 text-xs flex items-center justify-center"
        >
          {name.slice(0, 2)}
        </div>
        <div className="text-sm font-semibold">{name}</div>
      </div>
      <div className="space-x-1 flex justify-center items-center">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="hover:bg-zinc-300 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-colors px-2 py-1 my-1 rounded-full cursor-pointer"
          >
            <HiDotsHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-800 text-zinc-300 border-zinc-800">
            <DropdownMenuItem
              onClick={handleDeleteServer}
              variant="destructive"
              className="text-zinc-300 flex justify-start items-center space-x-1"
            >
              <MdDelete />
              <span className="text-sm font-semibold">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}

export default DirectConversationCard;
