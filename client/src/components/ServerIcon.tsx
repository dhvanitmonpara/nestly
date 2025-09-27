import { MdDelete, MdEdit } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../components/ui/context-menu";
import useHandleAuthError from "../hooks/useHandleAuthError";
import type { AxiosError } from "axios";
import axios from "axios";
import env from "../conf/env";
import { toast } from "sonner";
import useServerStore from "../store/serverStore";
import { useState } from "react";
import { FaShare } from "react-icons/fa";
import UpdateServerForm from "./UpdateServerForm";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

function ServerIcon({
  id,
  name,
  isOwner = false,
}: {
  id: number;
  name: string;
  isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { serverId } = useParams();

  const handleShare = () => {
    navigator.clipboard.writeText(`http://localhost:5173/join/s/${id}`);
    toast.info("Sharable link copied to your clipboard");
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/s/${id}`}
            key={id}
            className={`flex items-center justify-center select-none h-10 w-10 mt-1 transition-all duration-50 font-semibold ${
              id.toString() === serverId
                ? "bg-indigo-500 rounded-xl"
                : "bg-zinc-700/50 text-zinc-300 rounded-full hover:rounded-xl"
            }  cursor-pointer`}
          >
            {name.slice(0, 1).toUpperCase()}
          </Link>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-zinc-800 text-zinc-300 border-zinc-800">
          <ContextMenuItem
            onClick={() => setOpen(true)}
            className="text-zinc-100 focus:text-zinc-100 focus:bg-zinc-700 flex justify-start items-center space-x-1"
          >
            <MdEdit className="text-zinc-300" />
            <span className=" font-semibold text-zinc-300">Edit</span>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleShare}
            className="text-zinc-100 focus:text-zinc-100 focus:bg-zinc-700 flex justify-start items-center space-x-1"
          >
            <FaShare className="text-zinc-300" />
            <span className=" font-semibold text-zinc-300">Share</span>
          </ContextMenuItem>
          {isOwner ? (
            <ContextMenuItem
              onClick={() => setDeleteOpen(true)}
              variant="destructive"
              className="text-zinc-300 flex justify-start items-center space-x-1"
            >
              <MdDelete />
              <span className=" font-semibold">Delete</span>
            </ContextMenuItem>
          ) : (
            <ContextMenuItem
              onClick={() => setDeleteOpen(true)}
              variant="destructive"
              className="text-zinc-300 flex justify-start items-center space-x-1"
            >
              <MdDelete />
              <span className=" font-semibold">Leave</span>
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
      <DeleteOrLeaveServer
        setOpen={setDeleteOpen}
        open={deleteOpen}
        isOwner={isOwner}
        id={id}
      />
      <UpdateServerForm open={open} setOpen={setOpen} id={id} name={name} />
    </>
  );
}

const DeleteOrLeaveServer = ({
  isOwner,
  id,
  open,
  setOpen,
}: {
  isOwner: boolean;
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { handleAuthError } = useHandleAuthError();
  const removeServer = useServerStore((s) => s.removeServer);
  const navigate = useNavigate();

  const handleDeleteServer = async () => {
    const toastId = toast.loading(`Deleting the server...`);
    try {
      const res = await axios.delete(
        `${env.SERVER_ENDPOINT}/servers/delete/${id.toString()}`,
        { withCredentials: true }
      );

      if (res.status !== 200) {
        toast.error("Failed to delete the server");
        return;
      }

      removeServer(id);
      navigate("/");
    } catch (error) {
      handleAuthError(error as AxiosError);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleLeaveServer = async () => {
    const toastId = toast.loading(`Leaving the server...`);
    try {
      const res = await axios.delete(
        `${env.SERVER_ENDPOINT}/servers/leave/${id.toString()}`,
        { withCredentials: true }
      );

      if (res.status !== 200) {
        toast.error("Failed to leave the server");
        return;
      }

      removeServer(id);
      navigate("/");
    } catch (error) {
      handleAuthError(error as AxiosError);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleDelete = async () => {
    try {
      if (isOwner) {
        await handleDeleteServer();
      } else {
        await handleLeaveServer();
      }
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800 !max-w-96">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60">
            Cancel
          </DialogClose>
          <DialogClose
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-zinc-100 font-semibold w-full rounded-md hover:bg-red-600 cursor-pointer disabled:opacity-60"
          >
            {isOwner ? "Delete" : "Leave"}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServerIcon;
