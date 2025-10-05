import { Loader2 } from "lucide-react"
import ServerHealthChecker from "../components/ServerHealthChecker"

function ServerHealthPage() {
  return (
    <div className="bg-zinc-900 text-zinc-200 flex justify-center items-center h-screen w-screen">
      <div className="flex flex-col justify-center items-center space-y-6">
        <div className="flex flex-col justify-center items-center">
          <p className="text-lg">Server is spinning up. It will take a moment.</p>
          <p className="text-zinc-400">You'll be redirected once the server is ready</p>
        </div>
        <Loader2 className="animate-spin transition-all duration-300" />
        <ServerHealthChecker />
      </div>
    </div>
  )
}

export default ServerHealthPage