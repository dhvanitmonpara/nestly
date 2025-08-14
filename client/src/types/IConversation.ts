import type { IDirectMessage } from "./IDirectMessage"
import type { IUser } from "./IUser"

interface IConversation {
    id: number
    user_id1: number
    user_id2: number
    user1: IUser
    user2: IUser
    messages?: IDirectMessage[]
}

export type { IConversation }