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
import useServerStore from "../store/serverStore";
import { useState } from "react";
import { FaShare } from "react-icons/fa";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import InputBox from "./InputBox";
import { useForm, type SubmitHandler } from "react-hook-form";

type ServerType = {
    name: string
}

function ServerIcon({ id, name, isOwner = false }: { id: number, name: string, isOwner: boolean }) {

    const [open, setOpen] = useState(false)

    const { serverId } = useParams()
    const { handleAuthError } = useHandleAuthError()
    const removeServer = useServerStore(s => s.removeServer)
    const setServer = useServerStore(s => s.setServers)
    const servers = useServerStore(s => s.servers)
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ServerType>({
        defaultValues: {
            name: name
        }
    })

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
        } finally {
            toast.dismiss(toastId)
        }
    }


    const handleUpdateServer: SubmitHandler<ServerType> = async (data: ServerType) => {
        const toastId = toast.loading("Updating server...")
        try {
            const res = await axios.put(
                `${env.SERVER_ENDPOINT}/servers/update/${id}`,
                data,
                { withCredentials: true }
            )

            if (res.status !== 200) {
                toast.error("Failed to delete the server")
                return
            }

            setOpen(false)
            setServer(servers.map(s => s.id.toString() === serverId ? {...s, name: data.name} : s))

        } catch (error) {
            handleAuthError(error as AxiosError)
        } finally {
            toast.dismiss(toastId)
        }
    }

    const handleShare = () => {
        navigator.clipboard.writeText(`http://localhost:5173/join/s/${id}`)
        toast.info("Sharable link copied to your clipboard")
    }

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger onClick={e => e.stopPropagation()}>
                    <Link to={`/s/${id}`} key={id} className={`flex items-center justify-center select-none h-10 w-10 mt-1 transition-all duration-50 font-semibold ${id.toString() === serverId ? "bg-violet-500 rounded-xl" : "bg-zinc-700/50 text-zinc-300 rounded-full hover:rounded-xl"}  cursor-pointer`}>
                        {name.slice(0, 1).toUpperCase()}
                    </Link>
                </ContextMenuTrigger>
                <ContextMenuContent className="bg-zinc-800 text-zinc-300 border-zinc-800">
                    <ContextMenuItem
                        onClick={() => setOpen(true)}
                        className="text-zinc-100 focus:text-zinc-100 focus:bg-zinc-700 flex justify-start items-center space-x-1"
                    >
                        <MdEdit className="text-zinc-300" />
                        <span className="text-sm font-semibold text-zinc-300">Edit</span>
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={handleShare}
                        className="text-zinc-100 focus:text-zinc-100 focus:bg-zinc-700 flex justify-start items-center space-x-1"
                    >
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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800 !max-w-96">
                    <DialogHeader>
                        <DialogTitle>Edit Server</DialogTitle>
                        <DialogDescription>
                            It'll be changed for each member of this server.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleUpdateServer)} className="space-y-4">
                        <InputBox
                            id="name"
                            label="Name"
                            placeholder="Update name"
                            error={errors.name?.message}
                            {...register("name")}
                        />
                        <button type="submit" className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60">
                            Update server
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ServerIcon