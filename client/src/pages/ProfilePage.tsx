import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import env from "../conf/env"
import type { IUser } from "../types/IUser"

export default function ProfilePage() {

    const [user, setUser] = useState<null | IUser>(null)
    const { userId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            try {
                if (!userId) return
                const user = await axios.get(`${env.SERVER_ENDPOINT}/users/id/${userId}`, { withCredentials: true })
                if (user.status !== 200) {
                    navigate("/")
                    return
                }
                setUser(user.data.data)
            } catch (error) {
                console.log(error)
            }
        })()
    }, [navigate, userId])
    
    if(!user) {
        navigate("/")
        return null
    }

    return (
        <div>
            {user.username}
        </div>
    )
}
