import { create } from "zustand";
import type { IServer } from "../types/IServer";
import type { IRoom } from "../types/IRoom";

interface ServerState {
    servers: IServer[];
    setServers: (servers: IServer[]) => void;
    addServer: (newServer: IServer) => void;
    removeServer: (id: number) => void;
    rooms: IRoom[]
    setRooms: (room: IRoom[]) => void
}

const useServerStore = create<ServerState>((set) => ({
    servers: [],
    setServers: (servers) => set(() => ({
        servers: servers
    })),
    addServer: (newServer) => set(state => ({
        servers: [...state.servers, newServer]
    })),
    removeServer: (id) => set(state => ({
        servers: state.servers.filter(c => c.id !== id)
    })),
    rooms: [],
    setRooms: (rooms) => set(() => ({ rooms }))
}));

export default useServerStore;