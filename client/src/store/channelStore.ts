import { create } from "zustand";
import type { IChannel } from "../types/IChannel";

interface ChannelState {
    channels: IChannel[];
    setChannels: (channels: IChannel[]) => void;
    addChannel: (newChannel: IChannel) => void;
    removeChannel: (id: number) => void;
}

const useChannelStore = create<ChannelState>((set) => ({
    channels: [],
    setChannels: (channels) => set(() => ({
        channels: channels
    })),
    addChannel: (newChannel) => set(state => ({
        channels: [...state.channels, newChannel]
    })),
    removeChannel: (id) => set(state => ({
        channels: state.channels.filter(c => c.id !== id)
    }))
}));

export default useChannelStore;