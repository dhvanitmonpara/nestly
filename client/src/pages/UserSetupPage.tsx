import axios from "axios"
import { useEffect } from "react"
import { toast } from "sonner"
import env from "../conf/env"
import { useNavigate, useParams } from "react-router-dom"
import { LuLoaderCircle } from "react-icons/lu"

function UserSetupPage() {

    const { email } = useParams()
    const naviagte = useNavigate()

    useEffect(() => {
        (async () => {
            try {
                if (!email) return
                const res = await axios.post(`${env.SERVER_ENDPOINT}/users/register`, { email }, { withCredentials: true })
                if (res.status !== 201) {
                    toast.error("Error setting up the user")
                    return
                }
                naviagte("/")
            } catch (error) {
                console.log(error)
                toast.error("Something went wrong while creating the user")
            }
        })()
    }, [email, naviagte])

    return (
        <div className="text-zinc-100 flex flex-col justify-center items-center space-y-4">
            <h3>Setting up the user, this may take a moment.</h3>
            <LuLoaderCircle className="animate-spin text-2xl"/>
        </div>
    )
}

export default UserSetupPage