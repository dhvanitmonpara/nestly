import type { ReactNode } from "react"

function ShowWarning({ icon, text }: { text: string, icon: ReactNode }) {
    return (
        <div className='flex flex-col justify-center items-center space-y-4 h-full text-zinc-500'>
            <span className='p-4 bg-zinc-800 rounded-full text-3xl'>
                {icon}
            </span>
            <p>
                {text}
            </p>
        </div>
    )
}

export default ShowWarning