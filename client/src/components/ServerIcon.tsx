import { MdDelete, MdEdit } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "../components/ui/context-menu"
import useHandleAuthError from "../hooks/useHandleAuthError";
import type { AxiosError } from "axios";
import axios from "axios";
import env from "../conf/env";
import { toast } from "sonner";
import useChannelStore from "../store/serverStore";
import { useState } from "react";
import { FaShare } from "react-icons/fa";

function ServerIcon({ id, name, isOwner = false }: { id: number, name: string, isOwner: boolean }) {

    const [open, setOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editInput, setEditInput] = useState("")

    const { serverId } = useParams()
    const { handleAuthError } = useHandleAuthError()
    const removeServer = useChannelStore(s => s.removeServer)
    const navigate = useNavigate()

    const handleDeleteServer = async () => {
        const toastId = toast.loading(`Deleting the server ${name}`)
        try {
            const res = await axios.delete(`${env.SERVER_ENDPOINT}/servers/delete/${id.toString()}`, { withCredentials: true })

            if (res.status !== 200) {
                toast.error("Failed to delete the server")
                return
            }

            removeServer(id)
            navigate("/")

        } catch (error) {
            handleAuthError(error as AxiosError)
            console.log("failed")
        } finally {
            toast.dismiss(toastId)
        }
    }


    const handleEditServer = async () => {
        try {
            const res = await axios.delete(`${env.SERVER_ENDPOINT}/servers/${id}`, { withCredentials: true })

            if (res.status !== 200) {
                toast.error("Failed to delete the server")
                return
            }

            removeServer(id)

        } catch (error) {
            handleAuthError(error as AxiosError)
        }
    }

    const handleShare = () => {
        navigator.clipboard.writeText(`http://localhost:5173/join/s/${id}`)
        toast.info("Sharable link copied to your clipboard")
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger onClick={e => e.stopPropagation()}>
                <Link to={`/s/${id}`} key={id} className={`flex items-center justify-center h-10 w-10 mt-1 transition-all duration-50 font-semibold ${id.toString() === serverId ? "bg-violet-500 rounded-xl" : "bg-zinc-700/50 rounded-full hover:rounded-xl"}  cursor-pointer`}>
                    {name.slice(0, 1).toUpperCase()}
                </Link>
            </ContextMenuTrigger>
            <ContextMenuContent className="bg-zinc-800 text-zinc-300 border-zinc-800">
                <ContextMenuItem onClick={() => {
                    setEditMode(true)
                    setEditInput(name)
                }} className="text-zinc-100 flex justify-start items-center space-x-1">
                    <MdEdit className="text-zinc-300" />
                    <span className="text-sm font-semibold text-zinc-300">Edit</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={handleShare} className="text-zinc-100 flex justify-start items-center space-x-1">
                    <FaShare className="text-zinc-300" />
                    <span className="text-sm font-semibold text-zinc-300">Share</span>
                </ContextMenuItem>
                {isOwner
                    ? <ContextMenuItem onClick={handleDeleteServer} variant="destructive" className="text-zinc-300 flex justify-start items-center space-x-1">
                        <MdDelete />
                        <span className="text-sm font-semibold">Delete</span>
                    </ContextMenuItem>
                    : <ContextMenuItem onClick={handleDeleteServer} variant="destructive" className="text-zinc-300 flex justify-start items-center space-x-1">
                        <MdDelete />
                        <span className="text-sm font-semibold">Leave</span>
                    </ContextMenuItem>
                }
            </ContextMenuContent>
        </ContextMenu>
    )
}

export default ServerIcon