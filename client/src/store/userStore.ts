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
    updateUser: (updateduser) =>
        set((state) => ({
            user: { ...state.user, ...updateduser },
        })),
    removeUser: () =>
        set({
            user: {
                id: 0,
                username: "",
                display_name: "",
                email: "",
                accent_color: ""
            },
        }),
}));

export default useUserStore;