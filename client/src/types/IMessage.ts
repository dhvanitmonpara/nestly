import type { IUser } from "./IUser"

interface IMessage {
    id: string
    channel_id: string
    user_id?: string
    content: string
    createdAt?: string
    updatedAt?: string
    user?: IUser
}

export type { IMessage }