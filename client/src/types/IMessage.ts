import type { IUser } from "./IUser"

interface IMessage {
    id: string
    channel_id: string
    user_id?: string
    content: string
    user?: IUser
}

export type { IMessage }