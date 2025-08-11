import { FiPlus } from "react-icons/fi"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import InputBox from "./InputBox"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import axios from "axios"
import env from "../conf/env"
import useUserStore from "../store/userStore"
import { useNavigate } from "react-router-dom"
import useChannelStore from "../store/serverStore"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

type ChannelDataType = {
    identifier: string
}

function CreateServerForm() {

    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<"create" | "join">("create")

    const user = useUserStore(s => s.user)
    const addServer = useChannelStore(s => s.addServer)
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ChannelDataType>()

    const onSubmit: SubmitHandler<ChannelDataType> = async (data: ChannelDataType) => {
        const toastId = toast.loading("Creating channel")
        try {
            setOpen(false)

            if (!data.identifier) {
                toast.info(`Channel ${mode === "create" ? "name" : "ID"} cannot be empty`)
                return
            }

            if (!user) {
                navigate("/auth/signin")
                return
            }

            if (mode === "create") {
                const res = await axios.post(`${env.SERVER_ENDPOINT}/servers/create`, {
                    name: data.identifier,
                    owner_id: user.id
                }, { withCredentials: true })

                if (res.status !== 200) {
                    toast.error("Failed to create a server")
                    return
                }

                addServer(res.data.server)
            } else {
                navigate(`/join/s/${data.identifier}`)
            }
            
        } catch (error) {
            console.error(error)
            toast.error("Failed to create a server")
        } finally {
            toast.dismiss(toastId)
            setValue("identifier", "")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="w-10 h-10 mt-1 flex items-center justify-center text-xl cursor-pointer transition-colors duration-300 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 rounded-xl">
                <FiPlus  />
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800 !max-w-96">
                <Tabs value={mode} onValueChange={v => setMode(v as ("create" | "join"))} defaultValue="create">
                    <TabsList className="mb-4">
                        <TabsTrigger value="create">Create</TabsTrigger>
                        <TabsTrigger value="join">Join</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create" className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Create Server</DialogTitle>
                            <DialogDescription>
                                Create a server and invite your friends.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <InputBox
                                error={errors.identifier?.message}
                                id="name"
                                label="Name"
                                key="name"
                                placeholder="Enter Server name"
                                {...register("identifier")}
                            />
                            <button type="submit" className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60">
                                Create a server
                            </button>
                        </form>
                    </TabsContent>
                    <TabsContent value="join" className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Join Server</DialogTitle>
                            <DialogDescription>
                                Join the server by typing the id of it.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <InputBox
                                error={errors.identifier?.message}
                                id="id"
                                label="Unique ID"
                                key="id"
                                placeholder="Enter Server ID"
                                {...register("identifier")}
                            />
                            <button type="submit" className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60">
                                Join a server
                            </button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>

    )
}

export default CreateServerForm