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
      <DropdownMenuTrigger className="rounded-md w-full p-1 flex space-x-2 cursor-pointer bg-zinc-800 hover:bg-zinc-700/40 transition-colors border-zinc-700 border absolute bottom-1 left-0">
        <div style={{ color: `#${user?.accentColor}` }} className="bg-zinc-900 rounded-full w-8 h-8 flex items-center justify-center">
          {user?.displayName.split("")[0].toUpperCase() ?? "U"}
        </div>
        <div>
          <p className="text-xs text-start text-zinc-300 font-semibold">{user?.displayName}</p>
          <p className="text-[0.70rem] text-start text-zinc-400">{user?.email}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`bg-zinc-800 text-zinc-100 border-zinc-800`}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuItem onClick={() => navigate(`/u/${user?.id}`)}>Profile</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileButton