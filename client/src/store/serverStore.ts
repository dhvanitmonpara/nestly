import { create } from "zustand";
import type { IServer } from "../types/IServer";
import type { IRoom } from "../types/IRoom";

interface ServerState {
  servers: IServer[];
  setServers: (servers: IServer[]) => void;
  addServer: (newServer: IServer) => void;
  removeServer: (id: number) => void;
  rooms: IRoom[];
  setRooms: (room: IRoom[]) => void;
  addRoomParticipant: (name: string) => void;
  removeRoomParticipant: (name: string) => void;
}

const useServerStore = create<ServerState>((set) => ({
  servers: [],
  setServers: (servers) =>
    set(() => ({
      servers: servers,
    })),
  addServer: (newServer) =>
    set((state) => ({
      servers: [...state.servers, newServer],
    })),
  removeServer: (id) =>
    set((state) => ({
      servers: state.servers.filter((c) => c.id !== id),
    })),
  rooms: [],
  setRooms: (rooms) => set(() => ({ rooms })),
  addRoomParticipant: (name) =>
    set((state) => {
      const room = state.rooms.find((c) => c.name === name);
      if (!room)
        return { rooms: [...state.rooms, { name, participantsCount: 1 }] };
      return {
        rooms: state.rooms.map((c) =>
          c.name === name
            ? { ...c, participantsCount: c.participantsCount + 1 }
            : c
        ),
      };
    }),
  removeRoomParticipant: (name) =>
    set((state) => {
      const room = state.rooms.find((c) => c.name === name);
      if (!room) return { rooms: state.rooms };
      return {
        rooms: state.rooms.map((c) =>
          c.name === name
            ? { ...c, participantsCount: c.participantsCount - 1 }
            : c
        ),
      };
    }),
}));

export default useServerStore;
