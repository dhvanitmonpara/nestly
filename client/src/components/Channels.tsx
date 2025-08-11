import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import env from "../conf/env"
import { toast } from "sonner"
import type { IChannel } from "../types/IChannel"
import ChannelCard from "./ChannelCard"
import useUserStore from "../store/userStore"
import useServerStore from "../store/serverStore"
import { Separator } from "../components/ui/separator"
import CreateChannelForm from "./CreateChannelForm"

function Channels() {

    const [channels, setChannels] = useState<IChannel[]>([])
    const [loading, setLoading] = useState(true)

    const { serverId } = useParams()
    const user = useUserStore(s => s.user)
    const server = useServerStore(s => s.servers.find(s => s.id.toString() === serverId))

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                setLoading(true);
                if (!serverId || !user) return;
                const res = await axios.get(`${env.SERVER_ENDPOINT}/channels/server/${serverId}`, { withCredentials: true });
                if (res.status !== 200 && res.status !== 304) {
                    toast.error("Failed to fetch channels");
                    return;
                }
                setChannels(res.data.channels);
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false);
            }
        };

        fetchChannels();
    }, [serverId, user]);

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-1">
            {serverId && <CreateChannelForm setChannel={setChannels} />}
            <Separator className="bg-zinc-800" />
            {serverId && channels.length > 0 && channels.map(channel => (
                <ChannelCard key={channel.id} id={channel.id} name={channel.name} type={channel.type} setChannel={setChannels} isOwner={user?.id === server?.owner_id} />
            ))}
        </div>
    )
}

export default Channels