interface IMessage {
    id: string
    channel_id: string
    user_id: string
    content: string
}

interface IMessageWithUser {
    id: string
    content: string
    channel_id: string
    user: {
        id: number;
        accent_color: string;
        username: string;
        display_name: string;
    };
}

export type { IMessage, IMessageWithUser }