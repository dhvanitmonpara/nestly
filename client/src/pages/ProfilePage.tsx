import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import env from "../conf/env"
import type { IUser } from "../types/IUser"
import ColorPicker from "../components/ColorPicker"

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

    if (!user) {
        navigate("/")
        return null
    }

    const setUserColor = (color: string) => {
        setUser({ ...user, accent_color: color })
    }

    return (
        <div className="pt-20 px-4">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <div className="mb-4">
                {user.username}
                <span className="text-sm text-gray-500"> ({user.email})</span>
            </div>
            <div className="text-sm text-gray-500">
                <ColorPicker setColor={setUserColor} defaultColor={user.accent_color} />
            </div>
        </div>
    )
}