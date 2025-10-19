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
import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import type { IChannel } from "../types/IChannel"

type ChannelDataType = {
    name: string
    type: "text" | "voice"
}

function CreateChannelForm({ setChannel }: { setChannel: React.Dispatch<React.SetStateAction<IChannel[]>> }) {

    const [open, setOpen] = useState(false)

    const user = useUserStore(s => s.user)
    const navigate = useNavigate()

    const { serverId } = useParams()

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

            if (!data.name) {
                toast.info(`Channel name cannot be empty`)
                return
            }

            if (!user) {
                navigate("/auth/signin")
                return
            }

            if (!serverId) {
                navigate("/")
                return
            }

            const res = await axios.post(`${env.SERVER_ENDPOINT}/channels/create`, {
                name: data.name,
                serverId,
                type: data.type
            }, { withCredentials: true })

            if (res.status !== 201) {
                toast.error("Failed to create a channel")
                return
            }

            setChannel(prev => [...prev, res.data.channel])

        } catch (error) {
            console.error(error)
            toast.error("Failed to create a channel")
        } finally {
            toast.dismiss(toastId)
            setValue("name", "")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className=" flex justify-start items-center space-x-2 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 rounded-md px-3 py-2 w-full cursor-pointer" onClick={() => setOpen(true)}>
                <FiPlus />
                <span className="font-semibold">
                    Create Channel
                </span>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800 !max-w-96">
                <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                    <DialogDescription>
                        Create a channel and invite your friends.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <InputBox
                        error={errors.name?.message}
                        id="name"
                        label="Name"
                        key="name"
                        placeholder="Enter Server name"
                        {...register("name")}
                    />
                    <Select defaultValue="text" onValueChange={(value) => setValue("type", value as ("text" | "voice"))}>
                        <SelectTrigger className="w-full bg-zinc-800 border-zinc-800">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-800">
                            <SelectItem className="bg-zinc-800 focus:bg-zinc-700 text-zinc-100 focus:text-zinc-100" value="text">Text</SelectItem>
                            <SelectItem className="bg-zinc-800 focus:bg-zinc-700 text-zinc-100 focus:text-zinc-100" value="voice">Voice</SelectItem>
                        </SelectContent>
                    </Select>
                    <button type="submit" className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60">
                        Create a channel
                    </button>
                </form>
            </DialogContent>
        </Dialog>

    )
}

export default CreateChannelForm