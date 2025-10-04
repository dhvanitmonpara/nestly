import type { IDirectMessage } from "./IDirectMessage"
import type { IUser } from "./IUser"

interface IConversation {
    id: number
    userId1: number
    userId2: number
    user1: IUser
    user2: IUser
    messages?: IDirectMessage[]
}

export type { IConversation }