import type { IUser } from "./IUser"

interface IMessage {
    id: string
    channelId: string
    userId?: string
    content: string
    createdAt?: string
    updatedAt?: string
    user: IUser
}

export type { IMessage }