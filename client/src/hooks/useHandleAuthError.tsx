import { useNavigate } from "react-router-dom"
import checkAuthError from "../utils/checkAuthError"
import type { AxiosError } from "axios"

const useHandleAuthError = () => {

    const handleAuthError = async (error: AxiosError) => {
        const refreshed = await checkAuthError(error)
        if (!refreshed) {
            naviagte("/auth/signin")
        }
    }

    const naviagte = useNavigate()
    return { handleAuthError }
}

export default useHandleAuthError