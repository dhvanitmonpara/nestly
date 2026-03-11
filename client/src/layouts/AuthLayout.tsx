import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"

function AuthLayout() {
    return (
        <div className="bg-zinc-900 h-screen w-screen flex justify-center items-center">
            <Outlet />
            <Toaster />
        </div>
    )
}

export default AuthLayout