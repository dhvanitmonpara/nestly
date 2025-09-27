import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import useHandleAuthError from "../hooks/useHandleAuthError"
import type { AxiosError } from "axios"
import axios from "axios"
import env from "../conf/env"
import { toast } from "sonner"
import type { IServer } from "../types/IServer"
import { Loader2 } from "lucide-react"
import useUserStore from "../store/userStore"

function JoinServerPage() {

    const [server, setServer] = useState<null | IServer>(null)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)

    const { serverId } = useParams()
    const user = useUserStore(s => s.user)
    const { handleAuthError } = useHandleAuthError()
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            try {
                if (!user) return
                setFetching(true)
                if (!serverId) return

                const res = await axios.get(`${env.SERVER_ENDPOINT}/servers/id/${serverId}`, { withCredentials: true })

                if (res.status !== 200) {
                    toast.error("Channel not found")
                }

                setServer(res.data.server)

                if (res.data.server.ownerId === user.id) {
                    navigate(`/c/${serverId}`)
                }

            } catch (error) {
                handleAuthError(error as AxiosError)
            } finally {
                setFetching(false)
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverId, navigate, user])

    const handleJoin = async () => {
        try {
            setLoading(true)

            if (!user) {
                navigate("/")
                return
            }

            const res = await axios.post(`${env.SERVER_ENDPOINT}/servers/join`, {
                user_id: user.id,
                serverId
            }, { withCredentials: true })

            if (res.status !== 200) {
                toast.error("Failed to join the channel")
                return
            }

            navigate(`/s/${serverId}?joinServer=${serverId}`)
        } catch (error) {
            handleAuthError(error as AxiosError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bg-zinc-900 text-zinc-100 h-screen w-screen z-50 top-0 left-0">
            <div className="flex flex-col justify-center items-center h-full space-y-4">
                <p>
                    Do you wanna join <span className="font-semibold">{server?.name}</span>?
                </p>
                {server?.ownerId !== user?.id && <button onClick={handleJoin} disabled={loading || fetching} className="bg-blue-700 font-semibold px-4 py-2 rounded-md hover:bg-blue-800 cursor-pointer">
                    {loading
                        ? <div className="flex justify-center items-center space-x-2">
                            <Loader2 className="animate-spin" />
                            <span>Joining...</span>
                        </div>
                        : "Join"
                    }
                </button>}
            </div>
        </div>
    )
}

export default JoinServerPage