import type { IMessage } from "./IMessage";

interface IChannel {
    id: number;
    name: string;
    type: "text" | "voice"
    messages: IMessage[];
};

export type { IChannel }