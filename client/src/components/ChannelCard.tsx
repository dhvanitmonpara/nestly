import { MdDelete, MdDone, MdEdit } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { IoMdClose } from "react-icons/io";
import { HiDotsHorizontal } from "react-icons/hi";
import useHandleAuthError from "../hooks/useHandleAuthError";
import type { AxiosError } from "axios";
import axios from "axios";
import env from "../conf/env";
import { toast } from "sonner";
import useChannelStore from "../store/channelStore";
import { useState } from "react";
import { FaShare } from "react-icons/fa";

function ChannelCard({ id, name, isOwner = false }: { id: number, name: string, isOwner: boolean }) {

    const [open, setOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editInput, setEditInput] = useState("")

    const { handleAuthError } = useHandleAuthError()
    const removeChannel = useChannelStore(s => s.removeChannel)
    const navigate = useNavigate()

    const handleDeleteChannel = async () => {
        const toastId = toast.loading(`Deleting the channel ${name}`)
        try {
            const res = await axios.delete(`${env.SERVER_ENDPOINT}/channels/delete/${id.toString()}`, { withCredentials: true })

            if (res.status !== 200) {
                toast.error("Failed to delete the channel")
                return
            }

            removeChannel(id)
            navigate("/")

        } catch (error) {
            handleAuthError(error as AxiosError)
            console.log("failed")
        } finally {
            toast.dismiss(toastId)
        }
    }


    const handleEditChannel = async () => {
        try {
            const res = await axios.delete(`${env.SERVER_ENDPOINT}/channels/${id}`, { withCredentials: true })

            if (res.status !== 200) {
                toast.error("Failed to delete the channel")
                return
            }

            removeChannel(id)

        } catch (error) {
            handleAuthError(error as AxiosError)
        }
    }

    const handleShare = () => {
        navigator.clipboard.writeText(`http://localhost:5173/join/c/${id}`)
        toast.info("Sharable link copied to your clipboard")
    }

    return (
        <Link to={`/c/${id}`} key={id} className={`flex items-center justify-between ${editMode ? "py-3 transition-colors" : "p-3 hover:bg-zinc-700/50"} cursor-pointer rounded-md`}>
            {editMode
                ? <div className="bg-zinc-700/70 rounded-md relative w-full">
                    <input
                        type="text"
                        value={editInput}
                        onChange={e => setEditInput(e.target.value)}
                        autoFocus
                        className="px-3 py-2 w-44 rounded-md"
                    />
                    <div onClick={handleEditChannel} className="flex flex-col justify-center items-center ml-1 absolute -right-6 top-0">
                        <button className={`p-0.5 bg-green-500 hover:bg-green-600 cursor-pointer rounded-full transition-all ${editInput ? "scale-100" : "scale-0"}`}>
                            <MdDone />
                        </button>
                        <button onClick={() => {
                            setEditInput("")
                            setEditMode(false)
                        }} className="p-0.5 bg-red-500 hover:bg-red-600 cursor-pointer rounded-full">
                            <IoMdClose />
                        </button>
                    </div>
                </div>
                : <span>{name}</span>
            }
            {!editMode && <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger onClick={e => e.stopPropagation()} className="hover:bg-zinc-300 hover:text-zinc-900 transition-colors p-2 rounded-full cursor-pointer">
                    <HiDotsHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-800 text-zinc-300 border-zinc-800">
                    <DropdownMenuItem onClick={() => {
                        setEditMode(true)
                        setEditInput(name)
                    }} className="text-zinc-100 flex justify-start items-center space-x-1">
                        <MdEdit className="text-zinc-300" />
                        <span className="text-sm font-semibold text-zinc-300">Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare} className="text-zinc-100 flex justify-start items-center space-x-1">
                        <FaShare className="text-zinc-300" />
                        <span className="text-sm font-semibold text-zinc-300">Share</span>
                    </DropdownMenuItem>
                    {isOwner
                        ? <DropdownMenuItem onClick={handleDeleteChannel} variant="destructive" className="text-zinc-300 flex justify-start items-center space-x-1">
                            <MdDelete />
                            <span className="text-sm font-semibold">Delete</span>
                        </DropdownMenuItem>
                        : <DropdownMenuItem onClick={handleDeleteChannel} variant="destructive" className="text-zinc-300 flex justify-start items-center space-x-1">
                            <MdDelete />
                            <span className="text-sm font-semibold">Leave</span>
                        </DropdownMenuItem>
                    }
                </DropdownMenuContent>
            </DropdownMenu>}
        </Link>
    )
}

export default ChannelCard