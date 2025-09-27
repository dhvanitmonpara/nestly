import { create } from "zustand";
import type { IUser } from "../types/IUser";

interface UserState {
    user: IUser | null;
    setUser: (user: IUser) => void;
    updateUser: (updateduser: IUser) => void;
    removeUser: () => void;
}

const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    updateUser: (updatedUser) =>
        set((state) => ({
            user: { ...state.user, ...updatedUser },
        })),
    removeUser: () =>
        set({
            user: {
                id: 0,
                username: "",
                displayName: "",
                email: "",
                accentColor: ""
            },
        }),
}));

export default useUserStore;