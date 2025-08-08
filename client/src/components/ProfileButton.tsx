import axios, { AxiosError } from "axios"
import { useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useUserStore from "../store/userStore"
import env from "../conf/env"
import useHandleAuthError from "../hooks/useHandleAuthError"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

function ProfileButton() {

  const navigate = useNavigate()
  const setUser = useUserStore(s => s.setUser)
  const user = useUserStore(s => s.user)
  const { handleAuthError } = useHandleAuthError()

  const fetchUser = useCallback(async () => {
    try {
      const user = await axios.get(`${env.SERVER_ENDPOINT}/users/me`, { withCredentials: true })

      if (user.status !== 200) {
        navigate("/auth/signin")
        return
      }

      setUser(user.data.data)
    } catch (error) {
      handleAuthError(error as AxiosError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, setUser])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full h-10 w-10 cursor-pointer bg-zinc-900 border-zinc-700 border fixed top-5 right-10">
        {user?.display_name.split("")[0].toUpperCase() ?? "U"}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-900 text-zinc-100 border-zinc-800">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem onClick={() => navigate(`/u/${user?.id}`)}>Profile</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileButton